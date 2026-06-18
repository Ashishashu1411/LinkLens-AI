/**
 * LinkLens AI - Background Service Worker (background.js)
 * Implements real-time background URL monitoring, whitelisting exceptions, dynamic badge updates,
 * and automatic redirection to the warning block page.
 */

// Global API default fallback
const DEFAULT_API_URL = 'https://linklens-ai-ssu5.onrender.com';

// Listen for messages from the popup panel (e.g. manual scan triggers)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCAN_URL') {
    const { url, apiUrl } = request;

    performScan(url, apiUrl)
      .then(response => {
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('[LinkLens SW] Manual Scan error:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});

// --- 1. Tab Navigation & Activation Event Listeners ---

// Listen for tab URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We trigger the scan when the URL loading starts/changes and has a valid URL
  if (changeInfo.url) {
    handleUrlChange(tabId, changeInfo.url);
  }
});

// Listen for tab switching
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url) return;
    handleUrlChange(activeInfo.tabId, tab.url);
  });
});

/**
 * Handles tab URL transitions: filters internal pages, checks whitelist exceptions,
 * checks cache, and performs background scans.
 */
async function handleUrlChange(tabId, url) {
  if (isInternalBrowserUrl(url)) {
    // Clear badge for internal pages
    chrome.action.setBadgeText({ tabId: tabId, text: '' });
    return;
  }

  const host = getHostname(url);

  try {
    // Get whitelist, cache, and API settings from local storage
    chrome.storage.local.get(['allowedUrls', 'scanCache', 'apiUrl'], async (res) => {
      const allowedUrls = res.allowedUrls || [];
      const cache = res.scanCache || {};
      let apiGatewayUrl = res.apiUrl;
      const isUrlValid = apiGatewayUrl && 
                         !apiGatewayUrl.includes('localhost') && 
                         !apiGatewayUrl.includes('127.0.0.1') && 
                         apiGatewayUrl.endsWith('/api/analyze');
      if (!isUrlValid) {
        apiGatewayUrl = DEFAULT_API_URL;
      }

      // 1. If domain is whitelisted by the user, bypass blocking (but show warning badge for awareness)
      const isWhitelisted = allowedUrls.includes(host);

      // 2. Check if we already have a cached scan for this URL
      if (cache[url]) {
        const cachedData = cache[url];
        updateTabBadge(tabId, cachedData.risk_score, cachedData.prediction);

        if (!isWhitelisted && (cachedData.prediction.toLowerCase().includes('phishing') || cachedData.risk_score >= 80)) {
          redirectToWarningPage(tabId, url, cachedData);
        }
        return;
      }

      // 3. Set badge to "..." loading state during background analysis
      chrome.action.setBadgeText({ tabId: tabId, text: '...' });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#0066ff' }); // Blue during scan

      // 4. Perform background scan
      try {
        const scanData = await performScan(url, apiGatewayUrl);

        // Cache result in storage
        cache[url] = scanData;

        // Update history log in background
        chrome.storage.local.get(['scanHistory'], (histRes) => {
          let history = histRes.scanHistory || [];
          history = history.filter(item => item.url !== url);
          history.unshift({
            url: url,
            prediction: scanData.prediction,
            risk_score: scanData.risk_score,
            timestamp: Date.now()
          });
          if (history.length > 50) history = history.slice(0, 50);

          chrome.storage.local.set({
            scanCache: cache,
            scanHistory: history
          });
        });

        // Update tab badge
        updateTabBadge(tabId, scanData.risk_score, scanData.prediction);

        // Redirect to warning page if it is Phishing or score is above 80 AND not whitelisted
        if (!isWhitelisted && (scanData.prediction.toLowerCase().includes('phishing') || scanData.risk_score >= 80)) {
          redirectToWarningPage(tabId, url, scanData);
        }
      } catch (scanErr) {
        console.error('[LinkLens SW] Background scan failed:', scanErr);
        // Show "ERR" badge in case of connection failure
        chrome.action.setBadgeText({ tabId: tabId, text: 'ERR' });
        chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#4b5563' }); // Slate gray
      }
    });
  } catch (err) {
    console.error('[LinkLens SW] Storage lookup crash:', err);
  }
}

/**
 * Redirects the tab to warning.html with serialized threat parameters.
 */
function redirectToWarningPage(tabId, targetUrl, data) {
  const warningUrl = chrome.runtime.getURL('warning.html') +
    `?url=${encodeURIComponent(targetUrl)}` +
    `&score=${data.risk_score}` +
    `&reasons=${encodeURIComponent(JSON.stringify(data.reasons))}`;

  chrome.tabs.update(tabId, { url: warningUrl });
}

/**
 * Dynamically updates the extension icon badge text and color for a specific tab.
 */
function updateTabBadge(tabId, score, prediction) {
  chrome.action.setBadgeText({ tabId: tabId, text: String(score) });

  let badgeColor = '#00ff87'; // Legitimate (Green)
  const predLower = prediction.toLowerCase();

  if (predLower.includes('phishing') || predLower.includes('malware') || predLower.includes('danger')) {
    badgeColor = '#ff0055'; // Phishing (Red)
  } else if (predLower.includes('defac') || predLower.includes('susp')) {
    badgeColor = '#ff9f00'; // Suspicious (Orange)
  } else if (score >= 70) {
    badgeColor = '#ff0055';
  } else if (score >= 40) {
    badgeColor = '#ff9f00';
  }

  chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: badgeColor });
}

/**
 * Sends a POST request to the API with an AbortController timeout.
 */
async function performScan(targetUrl, apiEndpoint) {
  const timeoutMs = 60000; // 60s for Render free tier cold starts
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Server status: ${response.status}`);
    }

    const data = await response.json();
    const normalizedData = normalizeApiResponse(data, targetUrl);

    // If score > 80, show a desktop notification
    if (normalizedData.risk_score > 80) {
      triggerHighRiskNotification(normalizedData.url, normalizedData.risk_score, normalizedData.prediction);
    }

    return normalizedData;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Scan timeout.');
    }
    throw error;
  }
}

/**
 * Normalizes API responses across Flask/FastAPI structures.
 */
function normalizeApiResponse(raw, fallbackUrl) {
  let prediction = 'Legitimate';
  if (raw.prediction) {
    prediction = raw.prediction;
  } else if (raw.verdict) {
    if (raw.verdict === 'DANGEROUS') {
      prediction = raw.threat_type || 'Phishing';
    } else if (raw.verdict === 'SUSPICIOUS') {
      prediction = raw.threat_type || 'Suspicious';
    } else {
      prediction = 'Legitimate';
    }
  }

  let riskScore = 0;
  if (typeof raw.risk_score === 'number') {
    riskScore = raw.risk_score;
  } else if (typeof raw.riskScore === 'number') {
    riskScore = raw.riskScore;
  }

  let confidence = 0;
  if (typeof raw.confidence === 'number') {
    confidence = raw.confidence;
  } else if (typeof raw.ml_threat_probability === 'number') {
    confidence = raw.ml_threat_probability;
  } else if (raw.ml_probabilities && typeof raw.predicted_class === 'number') {
    confidence = raw.ml_probabilities[raw.predicted_class] || 50;
  }

  let domainAge = 'Unknown';
  if (raw.domain_age !== undefined) {
    domainAge = typeof raw.domain_age === 'number' ? `${raw.domain_age} days` : raw.domain_age;
  } else if (raw.live_metrics && raw.live_metrics.domain_age_days !== undefined) {
    const ageDays = raw.live_metrics.domain_age_days;
    if (ageDays === -1) {
      domainAge = 'Unknown';
    } else if (ageDays < 365) {
      domainAge = `${ageDays} days`;
    } else {
      const years = Math.floor(ageDays / 365);
      const remainingDays = ageDays % 365;
      domainAge = `${years} year(s), ${remainingDays} days`;
    }
  }

  let reasons = [];
  if (Array.isArray(raw.reasons)) {
    reasons = raw.reasons;
  } else if (raw.reasons_list && Array.isArray(raw.reasons_list)) {
    reasons = raw.reasons_list;
  }

  return {
    url: raw.url || fallbackUrl,
    prediction: prediction,
    confidence: confidence,
    risk_score: Math.round(riskScore),
    domain_age: domainAge,
    reasons: reasons
  };
}

/**
 * Triggers native system alerts.
 */
function triggerHighRiskNotification(url, riskScore, prediction) {
  const truncatedUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;

  chrome.notifications.create('high-risk-alert-' + Date.now(), {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '⚠️ High-Risk Website Detected',
    message: `Warning: LinkLens AI flagged this page!\nURL: ${truncatedUrl}\nVerdict: ${prediction}\nRisk Score: ${riskScore}%`,
    contextMessage: 'Proceed with caution.',
    priority: 2,
    requireInteraction: true
  });
}

// Helper utilities
function isInternalBrowserUrl(url) {
  if (!url) return true;
  const protocols = ['chrome:', 'chrome-extension:', 'edge:', 'brave:', 'about:', 'file:', 'view-source:', 'devtools:'];
  return protocols.some(proto => url.toLowerCase().startsWith(proto));
}

function getHostname(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch (e) {
    return urlStr;
  }
}

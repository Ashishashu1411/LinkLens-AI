/**
 * LinkLens AI - Warning Page Controller (warning.js)
 * Manages blocked site parameters, telemetry rendering, exception setting, and redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlDisplay = document.getElementById('blocked-url-display');
  const verdictDisplay = document.getElementById('blocked-verdict-display');
  const scoreDisplay = document.getElementById('blocked-score-display');
  const reasonsList = document.getElementById('blocked-reasons-list');
  
  const goBackBtn = document.getElementById('go-back-btn');
  const proceedBtn = document.getElementById('proceed-btn');

  // --- 1. Extract URL Parameters ---
  const getQueryParams = () => {
    const params = {};
    const search = window.location.search.substring(1);
    if (!search) return params;
    
    const pairs = search.split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      const key = decodeURIComponent(pair[0]);
      const value = decodeURIComponent(pair[1] || '');
      params[key] = value;
    }
    return params;
  };

  const params = getQueryParams();
  const blockedUrl = params.url || 'https://unknown-domain.com';
  const riskScore = parseInt(params.score || '0', 10);
  let reasons = [];

  try {
    reasons = JSON.parse(params.reasons || '[]');
  } catch (e) {
    console.error('[LinkLens Warning] Failed to parse reasons:', e);
    reasons = [];
  }

  // --- 2. Render Telemetry Data ---
  if (urlDisplay) {
    urlDisplay.textContent = blockedUrl;
    urlDisplay.title = blockedUrl;
  }

  if (scoreDisplay) {
    scoreDisplay.textContent = `${riskScore}%`;
  }

  if (verdictDisplay) {
    if (riskScore >= 80) {
      verdictDisplay.textContent = 'HIGH-RISK MALICIOUS SITE';
      verdictDisplay.style.color = 'var(--accent-red)';
    } else if (riskScore >= 40) {
      verdictDisplay.textContent = 'SUSPICIOUS INDICATORS DETECTED';
      verdictDisplay.style.color = '#ff9f00';
    } else {
      verdictDisplay.textContent = 'RESTRICTED DOMAIN';
      verdictDisplay.style.color = '#ffb300';
    }
  }

  if (reasonsList) {
    reasonsList.innerHTML = '';
    if (reasons.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Website flagged due to machine learning prediction models.';
      reasonsList.appendChild(li);
    } else {
      reasons.forEach(reason => {
        const li = document.createElement('li');
        li.textContent = reason;
        reasonsList.appendChild(li);
      });
    }
  }

  // --- 3. Extract Hostname for Exception List ---
  const getHostname = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname;
    } catch(e) {
      return urlStr;
    }
  };

  const blockedHost = getHostname(blockedUrl);

  // --- 4. Navigation Event Handlers ---
  
  // Go Back to Safety
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      // If there is browser history to go back to, navigate back.
      // Otherwise, redirect to the browser's blank page.
      if (document.referrer && !document.referrer.includes(chrome.runtime.id)) {
        history.back();
      } else {
        window.location.href = 'about:newtab';
      }
    });
  }

  // Proceed Anyway (Bypass Block)
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      // If chrome.storage is available (loaded as extension)
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['allowedUrls'], (res) => {
          const allowed = res.allowedUrls || [];
          if (!allowed.includes(blockedHost)) {
            allowed.push(blockedHost);
          }
          chrome.storage.local.set({ allowedUrls: allowed }, () => {
            console.log(`[LinkLens Warning] Domain '${blockedHost}' whitelisted. Redirecting...`);
            // Redirect current tab to the original blocked site URL
            window.location.href = blockedUrl;
          });
        });
      } else {
        // Fallback for preview mode
        window.location.href = blockedUrl;
      }
    });
  }
});

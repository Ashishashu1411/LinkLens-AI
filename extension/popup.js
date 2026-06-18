/**
 * LinkLens AI Extension (popup.js)
 * Coordinates UI states, caching, local storage history, navigation, and backend interaction.
 * Includes defensive checks and fallbacks for tab query and storage API access.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const targetUrlText = document.getElementById('target-url-text');
  const activeTabBadge = document.getElementById('active-tab-badge');
  const copyUrlBtn = document.getElementById('copy-url-btn');

  const tabScan = document.getElementById('nav-scan-btn');
  const tabHistory = document.getElementById('nav-history-btn');
  const tabSettings = document.getElementById('nav-settings-btn');

  const viewScan = document.getElementById('view-scan');
  const viewHistory = document.getElementById('view-history');
  const viewSettings = document.getElementById('view-settings');

  const scanWebsiteBtn = document.getElementById('scan-website-btn');
  const retryScanBtn = document.getElementById('retry-scan-btn');

  const scanLoading = document.getElementById('scan-loading');
  const scanError = document.getElementById('scan-error');
  const scanResults = document.getElementById('scan-results');

  const dangerWarningBanner = document.getElementById('danger-warning-banner');
  const resultVerdict = document.getElementById('result-verdict');
  const resultThreatType = document.getElementById('result-threat-type');
  const resultRiskValue = document.getElementById('result-risk-value');
  const meterFill = document.getElementById('meter-fill');
  const resultConfidence = document.getElementById('result-confidence');
  const confidenceBarFill = document.getElementById('confidence-bar-fill');
  const resultDomainAge = document.getElementById('result-domain-age');
  const reasonsCountBadge = document.getElementById('reasons-count-badge');
  const reasonsList = document.getElementById('reasons-list');

  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyEmpty = document.getElementById('history-empty');
  const historyListWrapper = document.getElementById('history-list-wrapper');
  const historyItems = document.getElementById('history-items');

  const settingsApiUrl = document.getElementById('settings-api-url');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const settingsSaveSuccess = document.getElementById('settings-save-success');

  const statusIndicator = document.getElementById('footer-status-indicator');
  const statusText = document.getElementById('footer-status-text');

  // --- State Variables ---
  let currentUrl = '';
  let activeTabTitle = '';
  let apiGatewayUrl = 'https://linklens-ai-ssu5.onrender.com'; // Default FastAPI API
  const MAX_HISTORY_ITEMS = 50;

  // Global UI Logger Helper in case of crash
  const logCriticalError = (err) => {
    console.error('[LinkLens JS Global Error]', err);
    if (targetUrlText) {
      targetUrlText.textContent = `JS CRASH: ${err.message}\nStack: ${err.stack || 'None'}`;
      targetUrlText.style.color = '#ff0055';
      targetUrlText.style.whiteSpace = 'pre-wrap';
      targetUrlText.style.fontSize = '9px';
      targetUrlText.style.overflowY = 'auto';
      targetUrlText.style.maxHeight = '70px';
    }
    setSystemState('offline', 'CRITICAL ERROR');
  };

  try {
    // --- 1. Navigation Controller ---
    const switchView = (targetView) => {
      [viewScan, viewHistory, viewSettings].forEach(v => {
        if (v) v.classList.remove('active');
      });
      [tabScan, tabHistory, tabSettings].forEach(t => {
        if (t) t.classList.remove('active');
      });

      if (targetView === 'scan' && viewScan && tabScan) {
        viewScan.classList.add('active');
        tabScan.classList.add('active');
      } else if (targetView === 'history' && viewHistory && tabHistory) {
        viewHistory.classList.add('active');
        tabHistory.classList.add('active');
        renderHistoryList();
      } else if (targetView === 'settings' && viewSettings && tabSettings) {
        viewSettings.classList.add('add', 'active'); // Safe activation
        viewSettings.classList.add('active');
        tabSettings.classList.add('active');
        loadSettingsView();
      }
    };

    if (tabScan) tabScan.addEventListener('click', () => switchView('scan'));
    if (tabHistory) tabHistory.addEventListener('click', () => switchView('history'));
    if (tabSettings) tabSettings.addEventListener('click', () => switchView('settings'));

    // --- 2. Auto-Detect Browser URL with Fallbacks ---
    const detectActiveTab = () => {
      // Check if chrome.tabs is available (it will be missing if popup.html is opened directly as file)
      if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
        setSystemState('offline', 'ENV ERROR');
        targetUrlText.textContent = 'Preview Mode: Please load this folder unpackedly in chrome://extensions and open it from the extensions menu toolbar.';
        targetUrlText.style.color = '#ff9f00';
        if (scanWebsiteBtn) {
          scanWebsiteBtn.disabled = true;
          scanWebsiteBtn.style.opacity = '0.5';
        }
        return;
      }

      setSystemState('online', 'QUERYING TAB...');

      // Step A: Try query active tab in current window
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
          console.warn('[LinkLens JS] currentWindow query failed, trying lastFocusedWindow...');

          // Step B: Try query active tab in last focused window (often handles devtools/inspected popups)
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (fallbackTabs) => {
            if (chrome.runtime.lastError || !fallbackTabs || fallbackTabs.length === 0) {
              console.warn('[LinkLens JS] lastFocusedWindow query failed, querying any active tab...');

              // Step C: Query any active tab in the entire browser
              chrome.tabs.query({ active: true }, (allActiveTabs) => {
                if (chrome.runtime.lastError || !allActiveTabs || allActiveTabs.length === 0) {
                  setSystemState('offline', 'TAB DETECT ERROR');
                  targetUrlText.textContent = 'Failed to detect browser URL. Refresh and try again.';
                  if (scanWebsiteBtn) scanWebsiteBtn.disabled = true;
                } else {
                  processTab(allActiveTabs[0]);
                }
              });
            } else {
              processTab(fallbackTabs[0]);
            }
          });
        } else {
          processTab(tabs[0]);
        }
      });
    };

    const processTab = (tab) => {
      if (!tab) {
        setSystemState('offline', 'EMPTY TAB');
        targetUrlText.textContent = 'No active browser tab found.';
        return;
      }
      currentUrl = tab.url || '';
      activeTabTitle = tab.title || '';

      const isInternal = isInternalBrowserUrl(currentUrl);
      targetUrlText.textContent = currentUrl;
      targetUrlText.title = currentUrl;
      targetUrlText.style.color = ''; // reset color

      if (isInternal) {
        if (activeTabBadge) {
          activeTabBadge.textContent = 'SYSTEM PAGE';
          activeTabBadge.className = 'badge active-badge';
          activeTabBadge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          activeTabBadge.style.color = 'var(--text-muted)';
        }

        targetUrlText.textContent = 'Internal Browser Page (' + getHost(currentUrl) + ')';
        if (scanWebsiteBtn) {
          scanWebsiteBtn.disabled = true;
          scanWebsiteBtn.style.opacity = '0.5';
          scanWebsiteBtn.title = 'Cannot scan internal system domains.';
        }

        if (scanResults) scanResults.classList.add('hidden');
        if (scanLoading) scanLoading.classList.add('hidden');
        if (scanError) scanError.classList.add('hidden');
        setSystemState('online', 'READY');
      } else {
        if (activeTabBadge) {
          activeTabBadge.textContent = 'ACTIVE TAB';
          activeTabBadge.className = 'badge active-badge';
          activeTabBadge.style.borderColor = 'rgba(0, 240, 255, 0.25)';
          activeTabBadge.style.color = 'var(--accent-cyan)';
        }

        if (scanWebsiteBtn) {
          scanWebsiteBtn.disabled = false;
          scanWebsiteBtn.style.opacity = '1';
          scanWebsiteBtn.title = '';
        }

        checkCachedScan(currentUrl);
      }
    };

    const checkCachedScan = (url) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        setSystemState('online', 'SCAN PENDING');
        return;
      }
      chrome.storage.local.get(['scanCache'], (result) => {
        const cache = result.scanCache || {};
        if (cache[url]) {
          console.log('[LinkLens JS] Loading cached result for:', url);
          renderScanResults(cache[url]);
        } else {
          if (scanResults) scanResults.classList.add('hidden');
          if (scanLoading) scanLoading.classList.add('hidden');
          if (scanError) scanError.classList.add('hidden');
          setSystemState('online', 'SCAN PENDING');
        }
      });
    };

    const isInternalBrowserUrl = (url) => {
      if (!url) return true;
      const protocols = ['chrome:', 'chrome-extension:', 'edge:', 'brave:', 'about:', 'file:', 'view-source:', 'devtools:'];
      return protocols.some(proto => url.toLowerCase().startsWith(proto));
    };

    const getHost = (urlStr) => {
      try {
        const parsed = new URL(urlStr);
        return parsed.hostname || urlStr;
      } catch (e) {
        return urlStr;
      }
    };

    // --- 3. Configuration & Settings ---
    const loadConfig = (callback) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        if (callback) callback();
        return;
      }
      chrome.storage.local.get(['apiUrl'], (res) => {
        if (res.apiUrl) {
          apiGatewayUrl = res.apiUrl;
        } else {
          apiGatewayUrl = "https://linklens-ai-ssu5.onrender.com/api/analyze"
        }
        if (callback) callback();
      });
    };

    const loadSettingsView = () => {
      if (settingsApiUrl) settingsApiUrl.value = apiGatewayUrl;
    };

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const enteredUrl = settingsApiUrl.value.trim();
        if (!enteredUrl) return;

        try {
          new URL(enteredUrl);
          apiGatewayUrl = enteredUrl;

          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ apiUrl: enteredUrl }, () => {
              if (settingsSaveSuccess) {
                settingsSaveSuccess.classList.remove('hidden');
                setTimeout(() => {
                  settingsSaveSuccess.classList.add('hidden');
                }, 2000);
              }
              setSystemState('online', 'CONFIG SAVED');
            });
          } else {
            setSystemState('online', 'CONFIG MOCKED');
          }
        } catch (e) {
          alert('Please enter a valid HTTP/HTTPS endpoint gateway URL.');
        }
      });
    }

    // --- 4. Scanning Routine ---
    const executeScan = () => {
      if (!currentUrl || isInternalBrowserUrl(currentUrl)) return;

      if (scanLoading) scanLoading.classList.remove('hidden');
      if (scanError) scanError.classList.add('hidden');
      if (scanResults) scanResults.classList.add('hidden');
      if (scanWebsiteBtn) scanWebsiteBtn.disabled = true;
      setSystemState('online', 'SCANNING...');

      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        setTimeout(() => {
          showScanError('ENVIRONMENT ERROR', 'Extension API runtime is not active.');
        }, 1000);
        return;
      }

      chrome.runtime.sendMessage(
        { action: 'SCAN_URL', url: currentUrl, apiUrl: apiGatewayUrl },
        (response) => {
          if (scanWebsiteBtn) scanWebsiteBtn.disabled = false;
          if (scanLoading) scanLoading.classList.add('hidden');

          if (chrome.runtime.lastError || !response) {
            showScanError('CONNECTION FAILURE', 'Could not establish contact with LinkLens service worker.');
            return;
          }

          if (response.success && response.data) {
            saveScanToCacheAndHistory(currentUrl, response.data);
            renderScanResults(response.data);
          } else {
            showScanError('SCAN FAILED', response.error || 'Server returned an invalid response.');
          }
        }
      );
    };

    if (scanWebsiteBtn) scanWebsiteBtn.addEventListener('click', executeScan);
    if (retryScanBtn) retryScanBtn.addEventListener('click', executeScan);

    const showScanError = (title, message) => {
      if (scanError) scanError.classList.remove('hidden');
      if (scanResults) scanResults.classList.add('hidden');
      const errorTitleElem = document.getElementById('error-title');
      const errorMessageElem = document.getElementById('error-message');
      if (errorTitleElem) errorTitleElem.textContent = title;
      if (errorMessageElem) errorMessageElem.textContent = message;
      setSystemState('offline', 'OFFLINE / ERR');
    };

    // --- 5. Render Threat Results ---
    const renderScanResults = (data) => {
      if (scanError) scanError.classList.add('hidden');
      if (scanLoading) scanLoading.classList.add('hidden');
      if (scanResults) scanResults.classList.remove('hidden');

      const prediction = data.prediction || 'Legitimate';
      const riskScore = typeof data.risk_score === 'number' ? data.risk_score : 0;
      const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
      const domainAge = data.domain_age || 'Unknown';
      const reasons = data.reasons || [];

      if (resultVerdict) {
        resultVerdict.className = 'verdict-value';
        resultVerdict.textContent = prediction.toUpperCase();
      }

      let severityClass = 'legitimate';
      let meterColor = 'var(--color-legitimate)';

      const predLower = prediction.toLowerCase();
      if (predLower.includes('phishing') || predLower.includes('malware') || predLower.includes('danger')) {
        severityClass = 'dangerous';
        meterColor = 'var(--color-phishing)';
        if (resultVerdict) resultVerdict.classList.add('dangerous');
        if (resultThreatType) resultThreatType.textContent = 'High-Risk Malicious Threat';
      } else if (predLower.includes('defacement') || predLower.includes('suspicious')) {
        severityClass = 'suspicious';
        meterColor = 'var(--color-suspicious)';
        if (resultVerdict) resultVerdict.classList.add('suspicious');
        if (resultThreatType) resultThreatType.textContent = 'Suspicious Indicators Found';
      } else {
        severityClass = 'legitimate';
        meterColor = 'var(--color-legitimate)';
        if (resultVerdict) resultVerdict.classList.add('legitimate');
        if (resultThreatType) resultThreatType.textContent = 'Verified / Clean Web Resource';
      }

      if (resultRiskValue) resultRiskValue.textContent = `${riskScore}%`;
      if (meterFill) {
        meterFill.style.stroke = meterColor;
        meterFill.setAttribute('stroke-dasharray', `${riskScore}, 100`);
      }

      if (resultConfidence) resultConfidence.textContent = `${confidence.toFixed(1)}%`;
      if (confidenceBarFill) confidenceBarFill.style.width = `${confidence}%`;
      if (resultDomainAge) resultDomainAge.textContent = domainAge;

      if (dangerWarningBanner) {
        if (predLower.includes('phishing') || riskScore >= 80) {
          dangerWarningBanner.classList.remove('hidden');
        } else {
          dangerWarningBanner.classList.add('hidden');
        }
      }

      if (reasonsList) {
        reasonsList.innerHTML = '';
        if (reasons.length === 0) {
          if (reasonsCountBadge) {
            reasonsCountBadge.textContent = '0 INDICATORS';
            reasonsCountBadge.className = 'badge count-badge';
          }
          const li = document.createElement('li');
          li.textContent = 'No suspicious signatures or evasion techniques detected.';
          li.style.fontStyle = 'italic';
          li.style.color = 'var(--text-muted)';
          reasonsList.appendChild(li);
        } else {
          if (reasonsCountBadge) {
            reasonsCountBadge.textContent = `${reasons.length} FLAG(S)`;
            reasonsCountBadge.className = 'badge count-badge active-badge';
          }
          reasons.forEach(reason => {
            const li = document.createElement('li');
            li.textContent = reason;
            reasonsList.appendChild(li);
          });
        }
      }

      // Also update the icon badge for this tab to match the threat assessment
      if (typeof chrome !== 'undefined' && chrome.action && chrome.action.setBadgeText) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            const tabId = tabs[0].id;
            chrome.action.setBadgeText({ tabId: tabId, text: String(riskScore) });

            let badgeColor = '#00ff87'; // Legitimate (Green)
            const predLower = prediction.toLowerCase();
            if (predLower.includes('phishing') || predLower.includes('malware') || predLower.includes('danger') || riskScore >= 70) {
              badgeColor = '#ff0055'; // Phishing (Red)
            } else if (predLower.includes('defac') || predLower.includes('susp') || riskScore >= 40) {
              badgeColor = '#ff9f00'; // Suspicious (Orange)
            }
            chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: badgeColor });
          }
        });
      }

      setSystemState('online', `AUDIT COMPLETED: ${prediction.toUpperCase()}`);
    };

    // --- 6. Local Storage Cache & Session History ---
    const saveScanToCacheAndHistory = (url, data) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

      chrome.storage.local.get(['scanCache', 'scanHistory'], (res) => {
        const cache = res.scanCache || {};
        cache[url] = data;

        let history = res.scanHistory || [];
        history = history.filter(item => item.url !== url);

        history.unshift({
          url: url,
          prediction: data.prediction,
          risk_score: data.risk_score,
          timestamp: Date.now()
        });

        if (history.length > MAX_HISTORY_ITEMS) {
          history = history.slice(0, MAX_HISTORY_ITEMS);
        }

        chrome.storage.local.set({
          scanCache: cache,
          scanHistory: history
        });
      });
    };

    // --- 7. History Renderer & Interactions ---
    const renderHistoryList = () => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        if (historyEmpty) historyEmpty.classList.remove('hidden');
        if (historyListWrapper) historyListWrapper.classList.add('hidden');
        return;
      }

      chrome.storage.local.get(['scanHistory'], (res) => {
        const history = res.scanHistory || [];

        if (history.length === 0) {
          if (historyEmpty) historyEmpty.classList.remove('hidden');
          if (historyListWrapper) historyListWrapper.classList.add('hidden');
          return;
        }

        if (historyEmpty) historyEmpty.classList.add('hidden');
        if (historyListWrapper) historyListWrapper.classList.remove('hidden');
        if (historyItems) {
          historyItems.innerHTML = '';

          history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';

            const predLower = item.prediction.toLowerCase();
            let badgeClass = 'legitimate';
            if (predLower.includes('phish') || predLower.includes('malware') || predLower.includes('danger')) {
              badgeClass = 'dangerous';
            } else if (predLower.includes('defac') || predLower.includes('susp')) {
              badgeClass = 'suspicious';
            }

            const dateStr = formatTimestamp(item.timestamp);
            const hostStr = getHost(item.url);

            div.innerHTML = `
              <div class="history-left">
                <span class="history-url" title="${item.url}">${hostStr}</span>
                <div class="history-meta">
                  <span>${dateStr}</span>
                </div>
              </div>
              <div class="history-right">
                <span class="history-badge ${badgeClass}">${item.prediction.toUpperCase()}</span>
                <span class="history-score">${item.risk_score}%</span>
              </div>
            `;

            div.addEventListener('click', () => {
              chrome.storage.local.get(['scanCache'], (cacheRes) => {
                const cache = cacheRes.scanCache || {};
                if (cache[item.url]) {
                  currentUrl = item.url;
                  if (targetUrlText) {
                    targetUrlText.textContent = item.url;
                    targetUrlText.title = item.url;
                  }

                  if (scanWebsiteBtn) {
                    scanWebsiteBtn.disabled = false;
                    scanWebsiteBtn.style.opacity = '1';
                  }
                  if (activeTabBadge) activeTabBadge.textContent = 'HISTORICAL VIEW';

                  switchView('scan');
                  renderScanResults(cache[item.url]);
                }
              });
            });

            historyItems.appendChild(div);
          });
        }
      });
    };

    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your local link scan logs?')) {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ scanHistory: [], scanCache: {} }, () => {
              renderHistoryList();
              setSystemState('online', 'LOGS PURGED');
            });
          }
        }
      });
    }

    const formatTimestamp = (ts) => {
      const date = new Date(ts);
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      const secs = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${mins}:${secs}`;
    };

    // --- 8. UI Utility Helpers ---
    const setSystemState = (state, label) => {
      if (statusIndicator) statusIndicator.className = 'status-indicator ' + state;
      if (statusText) statusText.textContent = label;
    };

    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        if (currentUrl && !isInternalBrowserUrl(currentUrl)) {
          navigator.clipboard.writeText(currentUrl)
            .then(() => {
              const originalTitle = copyUrlBtn.title;
              copyUrlBtn.title = 'Copied!';
              copyUrlBtn.style.color = 'var(--color-legitimate)';
              setTimeout(() => {
                copyUrlBtn.title = originalTitle;
                copyUrlBtn.style.color = 'var(--text-secondary)';
              }, 1500);
            })
            .catch(err => {
              console.error('[LinkLens JS] Copy failed:', err);
            });
        }
      });
    }

    // --- 9. Data Privacy Modal Handlers ---
    const openPrivacyBtn = document.getElementById('open-privacy-btn');
    const closePrivacyBtn = document.getElementById('close-privacy-btn');
    const privacyModal = document.getElementById('privacy-modal');

    if (openPrivacyBtn && privacyModal) {
      openPrivacyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.remove('hidden');
        setSystemState('online', 'PRIVACY POLICY');
      });
    }

    if (closePrivacyBtn && privacyModal) {
      closePrivacyBtn.addEventListener('click', () => {
        privacyModal.classList.add('hidden');
        setSystemState('online', 'READY');
      });
    }



    // --- Initialize App ---
    loadConfig(() => {
      detectActiveTab();
    });

  } catch (globalError) {
    logCriticalError(globalError);
  }
});

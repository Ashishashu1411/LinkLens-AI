/**
 * LinkLens AI - Content Script (content.js)
 * Injected automatically into matching web pages to assist with in-page link security inspections.
 * 
 * Currently acts as a communication bridge/entrypoint.
 */

console.log('[LinkLens AI] Guard active. Real-time link diagnostics monitoring initialized.');

// Listen for messages from popup or background script if required in future expansions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // If the popup wants to extract page metadata or run DOM checks
  if (message.action === 'PING') {
    sendResponse({ status: 'active', url: window.location.href });
  }
  return true;
});

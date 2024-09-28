document.getElementById('old-site').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'fetchOldSite' });
  });
  
  document.getElementById('new-site').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'fetchNewSite' });
  });
  
  document.getElementById('both-sites').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'fetchBothSites' });
  });
BRWSR_TYPE.runtime.onInstalled.addListener(() => {
    BRWSR_TYPE.declarativeNetRequest.updateDynamicRules({
      addRules: [{
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            { header: "Access-Control-Allow-Origin", operation: "set", value: "*" }
          ]
        },
        condition: {
          urlFilter: "*://OLD_SITE/*",
          resourceTypes: ["xmlhttprequest"]
        }
      }],
      removeRuleIds: [1]
    });
  });
  
  BRWSR_TYPE.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchOldSite') {
      openAndFetchOldSite().then(sendResponse);
    } else if (request.action === 'fetchNewSite') {
      openAndFetchNewSite().then(sendResponse);
    } else if (request.action === 'fetchBothSites') {
      fetchBothSites().then(sendResponse);
    }
    return true; // Will respond asynchronously.
  });
  
  function openAndFetchOldSite() {
    return new Promise((resolve) => {
      const url = 'https://OLD_SITE/';
      BRWSR_TYPE.tabs.create({ url }, (tab) => {
        const tabId = tab.id;
  
        BRWSR_TYPE.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
          if (updatedTabId === tabId && changeInfo.status === 'complete') {
            BRWSR_TYPE.tabs.onUpdated.removeListener(listener);
            fetchOldSiteData(tabId).then(resolve);
          }
        });
      });
    });
  }
  
  function openAndFetchNewSite() {
    return new Promise((resolve) => {
      const url = 'https://NEW_SITE/v2/cert';
      BRWSR_TYPE.tabs.create({ url }, (tab) => {
        const tabId = tab.id;
  
        BRWSR_TYPE.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
          if (updatedTabId === tabId && changeInfo.status === 'complete') {
            BRWSR_TYPE.tabs.onUpdated.removeListener(listener);
            fetchNewSiteData(tabId).then(resolve);
          }
        });
      });
    });
  }
  
  async function fetchBothSites() {
    await openAndFetchOldSite();
    await openAndFetchNewSite();
  }
  
  async function fetchOldSiteData(tabId) {
    const url = 'https://OLD_SITE/';
    try {
      const response = await fetch(url, { credentials: 'include' });
      const text = await response.text();
      const lines = text.split('\n');
  
      // Remove empty lines from the end
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }
  
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];
  
      if (firstLine.startsWith('ssh-rsa-cert-v01@openssh.com')) {
        const filenameMatch = lastLine.match(/ssh -i (.*) -i/);
        if (filenameMatch && filenameMatch.length > 1) {
          const filename = 'old-' + filenameMatch[1].trim(); // Change extension to .cert.pub
          const blob = new Blob([firstLine], { type: 'application/octet-stream' });
  
          // Use FileReader to create a data URL
          const reader = new FileReader();
          reader.onload = (event) => {
            const blobUrl = event.target.result;
            BRWSR_TYPE.downloads.download({
              url: blobUrl,
              filename: filename,
              saveAs: true // Prompt the user to choose the save location
            });
  
            // Close the tab once done
            BRWSR_TYPE.tabs.remove(tabId);
          };
          reader.readAsDataURL(blob);
        }
      }
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    }
  }

  async function fetchNewSiteData(tabId) {
    // Send a message to the content script to extract the necessary data
    BRWSR_TYPE.tabs.sendMessage(tabId, { action: 'extractNewSiteData' }, (response) => {
      if (response && response.cert && response.command) {
        const firstLine = response.cert;
        const lastLine = response.command;
  
        if (firstLine.startsWith('ssh-rsa-cert-v01@openssh.com')) {
          const filenameMatch = lastLine.match(/ssh -i (.*) -i/);
          if (filenameMatch && filenameMatch.length > 1) {
            const filename = filenameMatch[1].trim();
            const blob = new Blob([firstLine], { type: 'application/octet-stream' });
  
            // Use FileReader to create a data URL
            const reader = new FileReader();
            reader.onload = (event) => {
              const blobUrl = event.target.result;
              BRWSR_TYPE.downloads.download({
                url: blobUrl,
                filename: filename,
                saveAs: true // Prompt the user to choose the save location
              });
  
              // Close the tab once done
              BRWSR_TYPE.tabs.remove(tabId);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    });
  }
  
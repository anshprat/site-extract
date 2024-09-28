// Extract the required information from the page
function extractNewSiteData() {
  const certElement = document.querySelector('p.cert');
  const commandElement = document.querySelector('span.command');

  if (certElement && commandElement) {
    const extractedData = {
      cert: certElement.textContent.trim(),
      command: commandElement.textContent
    };
    return extractedData;
  }
  return null;
}

// Listen for the prompt from background.js to return the extracted data
BRWSR_TYPE.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractNewSiteData') {
    sendResponse(extractNewSiteData());
  }
});
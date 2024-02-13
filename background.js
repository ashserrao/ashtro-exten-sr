chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ["./content.js"],
      })
      .then(() => {
        console.log("We have injected content script");
      })
      .catch((err) => console.log(err, "We have an error"));
  }
});

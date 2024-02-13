document.addEventListener("DOMContentLoaded", () => {
  // Getting selectors of the buttons
  const startVideoButton = document.querySelector("button#start-rec");
  const stopVideoButton = document.querySelector("button#stop-rec");

  // Adding event listeners
  startVideoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "request_recording" },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError, "Error starting the video");
          }
        }
      );
    });
  });

  stopVideoButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "stop_recording" },
        function (response) {
          if (!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.log(chrome.runtime.lastError, "Error stopping the video");
          }
        }
      );
    });
  });
});

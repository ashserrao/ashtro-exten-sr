var recorder = null;
var webcamRecorder = null;
var screenRecorder = null;

function onAccessApproved(screenStream, webcamStream) {
  screenRecorder = new MediaRecorder(screenStream);
  webcamRecorder = new MediaRecorder(webcamStream);

  screenRecorder.start();
  webcamRecorder.start();

  var blobs = {
    screen: [],
    webcam: [],
  };

  screenRecorder.ondataavailable = function (event) {
    blobs.screen.push(event.data);
  };

  webcamRecorder.ondataavailable = function (event) {
    blobs.webcam.push(event.data);
  };

  screenRecorder.onstop = function () {
    screenStream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    var screenBlob = new Blob(blobs.screen, { type: blobs.screen[0].type });
    var screenUrl = URL.createObjectURL(screenBlob);
    downloadFile(screenUrl, "screen-recording.webm");
  };

  webcamRecorder.onstop = function () {
    webcamStream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
    var webcamBlob = new Blob(blobs.webcam, { type: blobs.webcam[0].type });
    var webcamUrl = URL.createObjectURL(webcamBlob);
    downloadFile(webcamUrl, "webcam-recording.webm");
  };
}

function downloadFile(url, filename) {
  var a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    console.log("requesting recording");
    sendResponse(`request-processed: ${message.action}`);
    navigator.mediaDevices
      .getDisplayMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 2, // Enable stereo audio
        },
        video: {
          width: 999999999,
          height: 999999999,
        },
      })
      .then((screenStream) => {
        // Now, get user media for webcam
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              channelCount: 2, // Enable stereo audio
            },
          })
          .then((webcamStream) => {
            // Pass both streams to onAccessApproved
            onAccessApproved(screenStream, webcamStream);
            chrome.runtime.sendMessage({ action: "recording_started" });
          })
          .catch((error) => {
            console.error("Error accessing webcam", error);
          });
      })
      .catch((error) => {
        console.error("Error starting the video", error);
      });
  }

  if (message.action === "stop_recording") {
    console.log("stopping video");
    sendResponse(`request-processed: ${message.action}`);
    if (!screenRecorder || !webcamRecorder) return console.log("no recording");
    screenRecorder.stop();
    webcamRecorder.stop();
  }
});

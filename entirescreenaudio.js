var recorder = null;

function onAccessApproved(mergedStream) {
  recorder = new MediaRecorder(mergedStream);

  recorder.start();

  recorder.onstop = function () {
    mergedStream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
  };

  recorder.ondataavailable = function (event) {
    let recordedBlob = event.data;
    let url = URL.createObjectURL(recordedBlob);

    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `extension-recoding-${Date.now()}-screen-recording.webm`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };
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
            // Merge the streams
            const streams = [screenStream, webcamStream];
            const mergedStream = new MediaStream();

            streams.forEach((stream) => {
              stream.getTracks().forEach((track) => {
                mergedStream.addTrack(track);
              });
            });

            // Pass the merged stream to onAccessApproved
            onAccessApproved(mergedStream);
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
    if (!recorder) return console.log("no recording");
    recorder.stop();
  }
});

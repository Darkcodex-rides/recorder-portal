import { useRef, useState } from "react";
import RecordingControls from "./RecordingControls";
import RecordingTimer from "./RecordingTimer";
import Waveform from "./Waveform";
import { useRecordingContext } from "../../context/RecordingContext";
import { uploadRecording } from "../../services/api";
import useWebSocket from "../../hooks/useWebSocket";


function AudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const durationRef = useRef(0);

  const { addRecording } = useRecordingContext();

  // const updateDuration = (value) => {
  // durationRef.current = value;
  // setDuration(value);
 //};

  const { sendMessage } = useWebSocket();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(audioChunksRef.current, {
    type: "audio/webm",
  });

  const audioUrl = URL.createObjectURL(audioBlob);

  const recordingName = `Recording ${new Date().toLocaleTimeString()}`;

  try {
    const response = await uploadRecording(
      audioBlob,
      recordingName,
      durationRef.current

    );

    console.log("Upload successful:", response);

    const newRecording = {
  ...response.data,
  url: audioUrl,
  blob: audioBlob,
};

addRecording(newRecording);
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Failed to upload recording.");
  }

  stream.getTracks().forEach((track) => track.stop());

  console.log("Recording saved");
};

      mediaRecorder.start();

      setIsRecording(true);
      durationRef.current = 0;
      setDuration(0);

      sendMessage({
  type: "recording:start",
});

      console.log("Recording started");
    } catch (error) {
      console.error("Microphone access failed:", error);
      alert("Please allow microphone access to start recording.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    sendMessage({
  type: "recording:stop",
});

    console.log("Recording stopped");
  };

  return (
    <div className="recorder-card">
<div className="recording-status">
  <span
    className={`status-dot ${
      isRecording ? "recording" : "ready"
    }`}
  />

  <span>
    {isRecording ? "Recording in progress" : "Ready to record"}
  </span>
</div>

<h2>
  {isRecording ? "Recording..." : "Start a new recording"}
</h2>
      <RecordingTimer
        isRecording={isRecording}
        duration={duration}
        setDuration={setDuration}
        durationRef={durationRef}

      />
      <Waveform isRecording={isRecording} />

      <RecordingControls
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </div>
  );
}

export default AudioRecorder;
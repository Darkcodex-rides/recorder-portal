import {
  Headphones,
  Mic,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

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
  const { sendMessage } = useWebSocket();

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const audioUrl =
          URL.createObjectURL(audioBlob);

        const recordingName = `Recording ${new Date().toLocaleTimeString()}`;

        try {
          const response =
            await uploadRecording(
              audioBlob,
              recordingName,
              durationRef.current
            );

          console.log(
            "Upload successful:",
            response
          );

          const newRecording = {
            ...response.data,
            url: audioUrl,
            blob: audioBlob,
          };

          addRecording(newRecording);
        } catch (error) {
          console.error(
            "Upload failed:",
            error
          );

          alert(
            "Failed to upload recording."
          );
        }

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

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
      console.error(
        "Microphone access failed:",
        error
      );

      alert(
        "Please allow microphone access to start recording."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
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
    <section className="recorder-console">
      {/* Console Header */}
      <div className="recorder-console-header">
        <div className="recorder-console-title">
          <div className="recorder-console-icon">
            {isRecording ? (
              <Radio size={19} />
            ) : (
              <Mic size={19} />
            )}
          </div>

          <div>
            <div className="recorder-console-eyebrow">
              <span
                className={
                  isRecording
                    ? "live-indicator active"
                    : "live-indicator"
                }
              />

              {isRecording
                ? "LIVE CAPTURE"
                : "AUDIO CAPTURE"}
            </div>

            <h2>
              {isRecording
                ? "Recording in progress"
                : "Start a new recording"}
            </h2>
          </div>
        </div>

        <div className="recorder-quality">
          <Headphones size={14} />

          <span>48 KHZ</span>

          <i />

          <span>STEREO</span>
        </div>
      </div>

      {/* Main Console */}
      <div className="recorder-console-body">
        <div className="recorder-visualizer">
          <div className="visualizer-top">
            <span>
              {isRecording
                ? "CAPTURING AUDIO"
                : "INPUT MONITOR"}
            </span>

            <span>
              {isRecording
                ? "● REC"
                : "READY"}
            </span>
          </div>

          <Waveform
            isRecording={isRecording}
          />

          <div className="visualizer-scale">
            <span>-60</span>
            <span>-48</span>
            <span>-36</span>
            <span>-24</span>
            <span>-12</span>
            <span>0 DB</span>
          </div>
        </div>

        <div className="recorder-center">
          <div className="recorder-timer-label">
            ELAPSED TIME
          </div>

          <RecordingTimer
            isRecording={isRecording}
            duration={duration}
            setDuration={setDuration}
            durationRef={durationRef}
          />

          <div
            className={
              isRecording
                ? "recorder-state recording"
                : "recorder-state"
            }
          >
            <span />

            {isRecording
              ? "RECORDING"
              : "READY TO RECORD"}
          </div>
        </div>

        <RecordingControls
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
        />
      </div>

      {/* Console Footer */}
      <div className="recorder-console-footer">
        <div>
          <ShieldCheck size={14} />

          <span>
            Secure authenticated session
          </span>
        </div>

        <div>
          <Sparkles size={14} />

          <span>
            Audio automatically saved to your
            recordings
          </span>
        </div>

        <div className="recorder-format">
          WEBM / AUDIO
        </div>
      </div>
    </section>
  );
}

export default AudioRecorder;
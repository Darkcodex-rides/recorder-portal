function AudioPlayer({ recording }) {
  const audioUrl = `http://localhost:5000/api/recordings/${recording.id}/file`;

  return (
    <div className="audio-player">
      <audio controls src={audioUrl}>
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}

export default AudioPlayer;
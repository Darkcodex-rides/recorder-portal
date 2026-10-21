import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

SAMPLE_RATE = 16000
CHUNK_SECONDS = 8
FRAME_MS = 30
HOP_MS = 10
MIN_PITCH_HZ = 50
MAX_PITCH_HZ = 400


def analyze_frame(frame, sample_rate):
    frame = frame.astype(np.float64)
    frame = frame - np.mean(frame)

    rms = float(np.sqrt(np.mean(frame ** 2)))
    dbfs = 20 * np.log10(max(rms, 1e-8))

    # Autocorrelation using an FFT, avoiding a costly direct calculation.
    windowed = frame * np.hanning(len(frame))
    fft_size = 1 << (2 * len(windowed) - 1).bit_length()
    spectrum = np.fft.rfft(windowed, n=fft_size)
    autocorr = np.fft.irfft(spectrum * np.conjugate(spectrum))
    autocorr = autocorr[:len(windowed)]

    min_lag = int(sample_rate / MAX_PITCH_HZ)
    max_lag = min(
        int(sample_rate / MIN_PITCH_HZ),
        len(windowed) - 1,
    )

    if rms < 0.005 or max_lag <= min_lag:
        return rms, dbfs, None, 0.0

    candidates = autocorr[min_lag:max_lag + 1]
    best_lag = min_lag + int(np.argmax(candidates))
    confidence = float(
        autocorr[best_lag] / (autocorr[0] + 1e-12)
    )
    pitch_hz = sample_rate / best_lag

    if confidence < 0.35:
        return rms, dbfs, None, confidence

    return rms, dbfs, float(pitch_hz), confidence


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", help="Path to an audio recording")
    args = parser.parse_args()

    audio_path = Path(args.audio).resolve()
    if not audio_path.is_file():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    with tempfile.TemporaryDirectory(prefix="tone-test-") as temp_dir:
        wav_path = Path(temp_dir) / "audio-16khz-mono.wav"

        subprocess.run(
            [
                "ffmpeg", "-y", "-v", "error",
                "-i", str(audio_path),
                "-vn", "-ac", "1", "-ar", str(SAMPLE_RATE),
                "-c:a", "pcm_s16le", str(wav_path),
            ],
            check=True,
            timeout=120,
        )

        audio, sample_rate = sf.read(wav_path, dtype="float32")

    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    if len(audio) == 0:
        raise ValueError("Converted audio is empty.")

    frame_size = int(sample_rate * FRAME_MS / 1000)
    hop_size = int(sample_rate * HOP_MS / 1000)
    chunk_samples = CHUNK_SECONDS * sample_rate

    segments = []

    for chunk_start in range(0, len(audio), chunk_samples):
        chunk_end = min(chunk_start + chunk_samples, len(audio))
        chunk = audio[chunk_start:chunk_end]

        rms_values = []
        dbfs_values = []
        pitch_values = []
        voiced_frames = 0
        total_frames = 0

        for start in range(0, len(chunk) - frame_size + 1, hop_size):
            frame = chunk[start:start + frame_size]
            rms, dbfs, pitch, confidence = analyze_frame(
                frame, sample_rate
            )
            rms_values.append(rms)
            dbfs_values.append(dbfs)
            total_frames += 1

            if pitch is not None:
                pitch_values.append(pitch)
                voiced_frames += 1

        if not total_frames:
            continue

        segments.append({
            "start_seconds": round(chunk_start / sample_rate, 2),
            "end_seconds": round(chunk_end / sample_rate, 2),
            "median_pitch_hz": (
                round(float(np.median(pitch_values)), 1)
                if pitch_values else None
            ),
            "pitch_range_hz": (
                {
                    "min": round(float(np.percentile(pitch_values, 10)), 1),
                    "max": round(float(np.percentile(pitch_values, 90)), 1),
                }
                if pitch_values else None
            ),
            "mean_rms": round(float(np.mean(rms_values)), 5),
            "mean_loudness_dbfs": round(float(np.mean(dbfs_values)), 2),
            "voiced_frame_ratio": round(voiced_frames / total_frames, 3),
            "frames_analyzed": total_frames,
        })

    print(json.dumps({
        "audio_file": audio_path.name,
        "sample_rate": sample_rate,
        "frame_ms": FRAME_MS,
        "segments": segments,
        "note": (
            "Pitch and voice activity are approximate acoustic estimates. "
            "dBFS is relative digital level, not calibrated sound pressure. "
            "These measures do not establish a speaker's emotional state."
        ),
    }, indent=2))


if __name__ == "__main__":
    main()

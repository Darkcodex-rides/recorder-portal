import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

MODEL_ID = "Dpngtm/wav2vec2-emotion-recognition"
SAMPLE_RATE = 16000
CHUNK_SECONDS = 8


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", help="Path to an audio recording")
    args = parser.parse_args()

    audio_path = Path(args.audio).resolve()
    if not audio_path.is_file():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    print("Loading pretrained emotion model on CPU...")
    extractor = AutoFeatureExtractor.from_pretrained(MODEL_ID)
    model = AutoModelForAudioClassification.from_pretrained(MODEL_ID)
    model.eval()
    print("Model loaded.")

    with tempfile.TemporaryDirectory(prefix="emotion-test-") as temp_dir:
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
            raise ValueError("The converted audio file is empty.")

        chunk_samples = CHUNK_SECONDS * sample_rate
        results = []

        for start in range(0, len(audio), chunk_samples):
            chunk = audio[start:start + chunk_samples]
            if len(chunk) < sample_rate:
                continue

            inputs = extractor(
                chunk,
                sampling_rate=SAMPLE_RATE,
                return_tensors="pt",
                padding=True,
            )

            with torch.inference_mode():
                logits = model(**inputs).logits
                probabilities = torch.softmax(logits, dim=-1)[0]

            scores = {
                model.config.id2label[i]: round(float(probabilities[i]), 4)
                for i in range(len(probabilities))
            }
            best_index = int(torch.argmax(probabilities))
            start_seconds = start / sample_rate
            end_seconds = (start + len(chunk)) / sample_rate

            results.append({
                "start_seconds": round(start_seconds, 2),
                "end_seconds": round(end_seconds, 2),
                "emotion": model.config.id2label[best_index],
                "confidence": round(float(probabilities[best_index]), 4),
                "scores": scores,
            })

    if not results:
        raise ValueError(
            "No usable audio chunks found. Provide a recording with at least one second of audio."
        )

    counts = {}
    for result in results:
        counts[result["emotion"]] = counts.get(result["emotion"], 0) + 1

    report = {
        "model": MODEL_ID,
        "audio_file": audio_path.name,
        "sample_rate": SAMPLE_RATE,
        "chunk_seconds": CHUNK_SECONDS,
        "segments": results,
        "emotion_segment_counts": counts,
        "note": (
            "Predicted vocal emotion cues, not a definitive measure of a person's "
            "actual feelings. Confidence scores are model scores, not guaranteed "
            "probabilities of correctness."
        ),
    }

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

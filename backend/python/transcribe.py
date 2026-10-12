import json
import sys
from faster_whisper import WhisperModel


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Expected an audio file path"}))
        sys.exit(1)

    audio_path = sys.argv[1]

    try:
        model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
        )

        segments, info = model.transcribe(
            audio_path,
            beam_size=5,
        )

        transcript_segments = []
        full_text_parts = []

        for segment in segments:
            text = segment.text.strip()

            if text:
                transcript_segments.append({
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": text,
                })
                full_text_parts.append(text)

        print(json.dumps({
            "language": info.language,
            "languageProbability": round(info.language_probability, 3),
            "text": " ".join(full_text_parts),
            "segments": transcript_segments,
        }, ensure_ascii=False))

    except Exception as error:
        print(
            json.dumps({"error": str(error)}),
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()

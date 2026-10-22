
import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np
import torch
from torch import nn
from transformers import PretrainedConfig
from huggingface_hub import PyTorchModelHubMixin

MODEL_ID = "audeering/wav2small"
SAMPLE_RATE = 16000
CHUNK_SECONDS = 8
MIN_CHUNK_SECONDS = 1


def _prenorm(x, attention_mask=None):
    if attention_mask is not None:
        count = attention_mask.sum(1, keepdim=True)
        x = x - x.sum(1, keepdim=True) / count
        variance = (x * x).sum(1, keepdim=True) / count
    else:
        x = x - x.mean(1, keepdim=True)
        variance = (x * x).mean(1, keepdim=True)

    return x / torch.sqrt(variance + 1e-7)


class Spectrogram(nn.Module):
    def __init__(self, n_fft=64, n_time=64, hop_length=32):
        super().__init__()

        window = librosa.filters.get_window(
            "hann", n_time, fftbins=True
        )
        window = librosa.util.pad_center(window, size=n_time)

        rows, cols = np.meshgrid(
            np.arange(n_time), np.arange(n_fft)
        )
        omega = np.exp(-2 * np.pi * 1j / n_time)
        matrix = np.power(omega, rows * cols)
        matrix = matrix * window[None, :]
        matrix = matrix[: n_fft // 2 + 1, :]
        matrix = matrix[:, None, :]

        self.conv_real = nn.Conv1d(
            1, n_fft // 2 + 1, n_fft,
            stride=hop_length, bias=False
        )
        self.conv_imag = nn.Conv1d(
            1, n_fft // 2 + 1, n_fft,
            stride=hop_length, bias=False
        )

        with torch.no_grad():
            self.conv_real.weight.copy_(
                torch.tensor(np.real(matrix), dtype=torch.float32)
            )
            self.conv_imag.weight.copy_(
                torch.tensor(np.imag(matrix), dtype=torch.float32)
            )

        for parameter in self.parameters():
            parameter.requires_grad = False

    def forward(self, x):
        x = x[:, None, :]
        return self.conv_real(x) ** 2 + self.conv_imag(x) ** 2


class LogmelFilterBank(nn.Module):
    def __init__(self, sr=16000, n_fft=64, n_mels=26):
        super().__init__()

        weights = librosa.filters.mel(
            sr=sr,
            n_fft=n_fft,
            n_mels=n_mels,
            fmin=0.0,
            fmax=sr // 2,
        ).T

        self.register_buffer("melW", torch.tensor(weights, dtype=torch.float32))
        self.register_buffer("amin", torch.tensor([1e-10]))

    def forward(self, x):
        x = torch.matmul(x[:, None, :, :].transpose(2, 3), self.melW)
        x = torch.where(x > self.amin, x, self.amin)
        return 10 * torch.log10(x)


class Conv(nn.Module):
    def __init__(self, c_in, c_out, k=3, stride=1, padding=1):
        super().__init__()
        self.conv = nn.Conv2d(
            c_in, c_out, k, stride=stride, padding=padding, bias=False
        )
        self.norm = nn.BatchNorm2d(c_out)

    def forward(self, x):
        return torch.relu_(self.norm(self.conv(x)))


class Vgg7(nn.Module):
    def __init__(self):
        super().__init__()

        self.l1 = Conv(1, 13)
        self.l2 = Conv(13, 13)
        self.l3 = Conv(13, 13)
        self.maxpool_A = nn.MaxPool2d(3, stride=2, padding=1)
        self.l4 = Conv(13, 13)
        self.l5 = Conv(13, 13)
        self.l6 = Conv(13, 13)
        self.l7 = Conv(13, 13)
        self.lin = nn.Conv2d(13, 13, 1)
        self.sof = nn.Conv2d(13, 13, 1)
        self.spectrogram_extractor = Spectrogram()
        self.logmel_extractor = LogmelFilterBank()

    def forward(self, x, attention_mask=None):
        x = _prenorm(x, attention_mask=attention_mask)
        x = self.spectrogram_extractor(x)
        x = self.logmel_extractor(x)
        x = self.l1(x)
        x = self.l2(x)
        x = self.l3(x)
        x = self.maxpool_A(x)
        x = self.l4(x)
        x = self.l5(x)
        x = self.l6(x)
        x = self.l7(x)
        x = self.lin(x) * self.sof(x).softmax(2)
        x = x.sum(2)
        x = torch.cat([x, torch.bmm(x, x.transpose(1, 2))], 2)
        return x.reshape(-1, 338)


class Wav2SmallConfig(PretrainedConfig):
    model_type = "wav2vec2"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.half_mel = 13
        self.n_fft = 64
        self.n_time = 64
        self.hidden = 2 * self.half_mel * self.half_mel
        self.hop = self.n_time // 2


class Wav2Small(
    nn.Module,
    PyTorchModelHubMixin,
):
    def __init__(self, config=None, **kwargs):
        super().__init__()

        if config is None:
            config = Wav2SmallConfig(**kwargs)
        elif isinstance(config, dict):
            config = Wav2SmallConfig(**config)

        self.config = config
        self.vgg7 = Vgg7()
        self.adv = nn.Linear(config.hidden, 3)

    def forward(self, x, attention_mask=None):
        features = self.vgg7(x, attention_mask=attention_mask)
        return self.adv(features)


def analyze(audio_path):
    if not audio_path.is_file():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    print("Loading audio at 16 kHz...", file=sys.stderr)
    audio, _ = librosa.load(str(audio_path), sr=SAMPLE_RATE, mono=True)

    if len(audio) < SAMPLE_RATE * MIN_CHUNK_SECONDS:
        raise ValueError("Audio must contain at least one second of usable audio.")

    device = torch.device("cpu")
    print(f"Loading {MODEL_ID} on CPU...", file=sys.stderr)

    model = Wav2Small.from_pretrained(MODEL_ID).to(device).eval()
    chunk_size = CHUNK_SECONDS * SAMPLE_RATE
    results = []

    for start in range(0, len(audio), chunk_size):
        chunk = audio[start : start + chunk_size]

        if len(chunk) < SAMPLE_RATE * MIN_CHUNK_SECONDS:
            continue

        signal = torch.from_numpy(
            np.asarray(chunk, dtype=np.float32)
        ).unsqueeze(0).to(device)

        with torch.inference_mode():
            scores = model(signal).squeeze(0).tolist()

        results.append({
            "start_seconds": round(start / SAMPLE_RATE, 2),
            "end_seconds": round(
                (start + len(chunk)) / SAMPLE_RATE, 2
            ),
            "arousal": round(float(scores[0]), 4),
            "dominance": round(float(scores[1]), 4),
            "valence": round(float(scores[2]), 4),
        })

    if not results:
        raise ValueError("No usable audio segments found.")

    return {
        "model": MODEL_ID,
        "input_type": "audio waveform only; no transcript used",
        "sample_rate": SAMPLE_RATE,
        "chunk_seconds": CHUNK_SECONDS,
        "segments": results,
        "interpretation": (
            "Valence is an estimated positive-negative affect dimension, "
            "not a verified sentiment or a statement of the speaker's feelings. "
            "Arousal and dominance are separate affect dimensions. "
            "Scores are model outputs, not calibrated confidence values."
        ),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Estimate affect dimensions directly from audio."
    )
    parser.add_argument("audio_file", type=Path)
    args = parser.parse_args()

    try:
        report = analyze(args.audio_file)
        print(json.dumps(report, indent=2))
    except Exception as error:
        print(f"Audio sentiment analysis failed: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

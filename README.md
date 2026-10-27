# Design Recorder

**Design Recorder** is a full-stack audio recording, processing, transcription, and AI-powered insights platform built with **React, Node.js, Express, PostgreSQL, WebSockets, Python, FFmpeg, Whisper, Ollama, Docker, Grafana, Loki, and Promtail**.

Users can record and manage audio in the browser, convert and trim recordings, generate timestamped transcripts, summarize recordings, extract meeting intelligence, and analyze vocal emotion, tone, and audio-only affect dimensions. Authentication, PostgreSQL persistence, and an observability stack support the application.

## Demo Videos

### Original Assignment Demo

[▶️ Watch the Original Design Recorder Demo on Loom](https://www.loom.com/share/8ee5034b232d4014934f1c5a8d38892e)

### New Features Demo

[▶️ Watch the New Features Demo on Loom](https://www.loom.com/share/cff0f6c7b7994c5ab155fb10964b86fc)

### AI Meeting Intelligence, Emotion, Tone & Sentiment Analysis
[Watch the AI Audio Analysis Demo](https://www.loom.com/share/37af2a8d88af48a3917e67e253955bd9)

## Features

### 1. Authentication and Security

- User registration and login
- JWT-based authentication and protected routes
- Password hashing with bcrypt
- User-specific recording access and ownership checks
- Authentication expiry handling and logout
- File type and upload size validation
- Environment-based database credentials and JWT secrets

### 2. Audio Recording and Playback

- Record audio directly through the browser microphone
- Start and stop recording with timer and status indicators
- Upload and persist recordings
- Play back and download saved recordings
- Store recording metadata in PostgreSQL and audio files on the server
- Support common audio formats

### 3. Recording Management

- Dedicated Recordings page
- Search, filter, and sort recordings
- Rename recordings
- Soft-delete recordings and restore them from trash
- View recording metadata and duration
- User-specific recording lists

### 4. Audio Conversion

- Convert recordings between supported formats
- Generate WAV and MP3 audio files
- Process audio using FFmpeg
- Save converted output as a recording and play it back

### 5. Audio Trimming

- Specify start and end times
- Trim selected audio segments using FFmpeg
- Save and play back the resulting recording

### 6. AI-Powered Speech-to-Text Transcription

Generate transcripts from saved audio using **faster-whisper with the Whisper small model**, running locally.

- Transcribe recordings into text
- Detect the spoken language and display language-detection probability
- Generate timestamped transcript segments
- Store and retrieve transcript results in PostgreSQL
- Reuse saved transcripts when available

Transcription runs locally rather than relying on a paid cloud transcription API.

### 7. Local AI Recording Summaries

Generate summaries from recording transcripts using **Ollama** and the `qwen2.5:1.5b-instruct` model.

- Generate concise AI-powered summaries
- Display and retrieve saved summaries
- Persist summary results for later access
- Run the language model locally

The summary workflow uses transcript text: audio is transcribed first, and the resulting text is summarized.

### 8. AI Meeting Intelligence

Generate structured meeting insights from a recording's transcript.

- Extract key points
- Identify decisions
- Generate action items
- Save meeting-insight results in PostgreSQL
- Retrieve previously generated insights
- Present structured results in the recording interface

Meeting intelligence complements summaries by organizing useful meeting information into distinct categories. Its results are AI-generated and should be reviewed for accuracy.

### 9. Audio Emotion and Tone Analysis

Analyze the audio waveform to estimate emotion labels and vocal delivery characteristics.

- Run emotion recognition with `Dpngtm/wav2vec2-emotion-recognition`
- Analyze audio in short segments and display results over the recording timeline
- Estimate vocal tone features such as pitch, RMS energy, and voiced ratio
- Save and retrieve analysis results from PostgreSQL
- Run the model locally on CPU

Emotion labels are model predictions, not verified descriptions of a speaker's internal emotional state. Audio quality, language, context, and individual speaking style can affect results.

### 10. Audio-Only Sentiment / Affect Analysis

Estimate affect dimensions directly from the **audio waveform**, using `audeering/wav2small`. This feature does **not** use a transcript to calculate its scores.

- Analyze audio in segments
- Estimate **valence** (positive-to-negative affect dimension)
- Estimate **arousal** (activation or energy dimension)
- Estimate **dominance** (perceived control or assertiveness dimension)
- Save and retrieve results in PostgreSQL
- Display segment timestamps and scores in the recording interface

These values are model estimates, not calibrated confidence scores or definitive statements about what a speaker feels. They should not be treated as clinical or psychological assessments.

**Model licensing note:** `audeering/wav2small` is distributed under **CC BY-NC-SA 4.0** for non-commercial use. Review the model's current license and obtain any required permission before commercial deployment.

### 11. Real-Time Communication

The application supports WebSocket communication for recording-related events:

- `recording:start`
- `recording:stop`
- Recording status updates
- Connection events
- Error handling and message acknowledgements

WebSocket endpoint:

```text
ws://localhost:5000/ws
```

### 12. Observability and Logging

A local logging and monitoring pipeline uses Grafana, Loki, and Promtail.

```text
Node.js / Express Backend
          |
          v
     Backend Logs
          |
          v
       Promtail
          |
          v
         Loki
          |
          v
       Grafana
          |
          v
  React Observability Page
```

The monitoring dashboard provides visibility into backend logs and errors, recording uploads and deletions, WebSocket activity, recording events, error counts, and recording activity over time.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, React Router, Vite, JavaScript, Lucide React |
| Audio capture | MediaRecorder API, browser audio APIs |
| Audio processing | FFmpeg |
| Backend | Node.js, Express, REST APIs, WebSocket |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| File uploads | Multer |
| Speech-to-text | Python, faster-whisper, Whisper |
| Local language model | Ollama, Qwen 2.5 1.5B Instruct |
| Emotion recognition | Python, PyTorch, Transformers, `Dpngtm/wav2vec2-emotion-recognition` |
| Audio sentiment / affect | Python, PyTorch, librosa, `audeering/wav2small` |
| Observability | Grafana, Loki, Promtail |
| Infrastructure | Docker, Docker Compose |
| Version control | Git, GitHub |

## Architecture

```text
                       React Frontend
                       localhost:5173
                              |
                 +------------+-------------+
                 |            |             |
                 v            v             v
              REST APIs   WebSocket    Observability
                 |            |             |
                 v            v             v
           Node.js + Express             Grafana
           localhost:5000                   |
                 |                          v
          +------+-------+                 Loki
          |              |                  ^
          v              v                  |
      PostgreSQL      Audio Files        Promtail
          |              |                  ^
          |              v                  |
          |         FFmpeg Processing   Backend Logs
          |
          +---- Transcripts ----> Ollama / Qwen ----> Summaries
          |              |
          |              +----> Meeting Intelligence
          |                     (key points, decisions,
          |                      action items)
          |
          +---- Emotion and Tone Analysis
          |
          +---- Audio-only Affect Analysis
                 (valence, arousal, dominance)

Audio Files ----> Whisper / faster-whisper ----> Transcript Text
Audio Files ----> Emotion / Tone Models
Audio Files ----> wav2small Affect Model
```

## Project Structure

High-level overview; individual files may differ as features evolve.

```text
recorder-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── recordingController.js
│   │   │   ├── summaryController.js
│   │   │   ├── meetingInsightsController.js
│   │   │   ├── audioAnalysisController.js
│   │   │   └── audioSentimentController.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── websocket/
│   │   └── server.js
│   ├── python/
│   │   ├── transcribe.py
│   │   ├── analyze_audio_sentiment.py
│   │   └── analyze_audio_tone.py
│   ├── scripts/
│   ├── recordings/
│   ├── logs/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── recordings/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── infrastructure/
│   ├── docker-compose.yml
│   ├── loki/
│   ├── promtail/
│   └── grafana/
├── .gitignore
└── README.md
```

## Prerequisites

Install the following tools:

- Node.js and npm
- PostgreSQL
- Git
- Docker Desktop
- Python 3.13 for the local transcription and audio-analysis environments
- FFmpeg for audio conversion and trimming
- Ollama for local AI summarization and meeting intelligence

Recommended development versions:

```text
Node.js 24+
npm 11+
PostgreSQL 18+
Python 3.13
Docker Desktop
```

The Python AI features use separate virtual environments so their dependencies can be managed independently. The first run of a model may download model files and require additional disk space, memory, and processing time.

## Database Setup

Create the application database in PostgreSQL:

```sql
CREATE DATABASE design_recorder;
```

The database stores user information, recording metadata, transcript results, summaries, meeting insights, and audio-analysis results.

The `users` table stores user information such as:

```text
id
name
email
password_hash
created_at
```

The `recordings` table stores metadata such as:

```text
id
user_id
name
duration
file_name
file_path
mime_type
file_size
created_at
deleted_at
```

Additional tables persist transcript segments and AI results, including summaries, meeting insights, emotion/tone analysis, and audio sentiment/affect analysis. Run the database setup or migration scripts included in the project before using these features. Recordings are associated with users through `user_id`.

## Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=design_recorder
DB_PASSWORD=your_postgres_password
DB_PORT=5432

JWT_SECRET=your_secure_jwt_secret
```

Replace example values with your local configuration. Do not commit `.env` files or real credentials to Git.

## Installation

### 1. Clone the repository

```powershell
git clone https://github.com/Darkcodex-rides/recorder-portal.git
cd recorder-portal
```

### 2. Install backend dependencies

```powershell
cd backend
npm install
```

### 3. Install frontend dependencies

From the project root, open a terminal and run:

```powershell
cd frontend
npm install
```

### 4. Configure audio processing

Install FFmpeg and ensure the `ffmpeg` executable is available to the backend process through the system `PATH`.

Verify:

```powershell
ffmpeg -version
```

### 5. Configure local transcription

Install Python 3.13 and set up the transcription virtual environment and required packages according to the project's transcription script and dependencies.

The transcription implementation uses `faster-whisper` with the Whisper `small` model and CPU `int8` computation. The first model initialization may download model files.

### 6. Configure local AI summarization and meeting intelligence

Install Ollama and pull the configured model:

```powershell
ollama pull qwen2.5:1.5b-instruct
```

Verify the model responds:

```powershell
ollama run qwen2.5:1.5b-instruct "Reply with exactly: Local AI is working."
```

Ensure Ollama is running and accessible to the backend when using summarization and meeting intelligence.

### 7. Configure audio analysis environments

Create and install the dependencies for the emotion/tone and sentiment Python environments according to the project scripts and dependency setup. The sentiment analyzer uses `audeering/wav2small`; its license terms must be reviewed before commercial use.

## Running the Application

Run infrastructure, backend, frontend, and local AI services as needed in separate terminals.

### 1. Start observability infrastructure

```powershell
cd infrastructure
docker compose up -d
```

Verify the containers:

```powershell
docker ps
```

Expected services include Loki, Promtail, and Grafana.

### 2. Start the backend

```powershell
cd backend
npm run dev
```

Backend URL: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

### 3. Start the frontend

```powershell
cd frontend
npm run dev
```

Frontend URL: `http://localhost:5173`

### 4. Start local AI services

Ensure Ollama is running and the configured Qwen model is available. The Python environments for Whisper and audio analysis must also be configured for their respective features.

## Application Pages

### Login

- Register an account or log in to access protected application features.

### Dashboard

- Record audio using the browser microphone
- Start and stop recordings
- View recording duration and status
- Save recordings

### Recordings

- Browse, play, and download saved audio
- Search, filter, sort, and rename recordings
- Convert audio and trim segments
- Generate and view transcripts
- Generate and view AI summaries
- Generate meeting insights: key points, decisions, and action items
- Analyze audio emotion and vocal tone
- Analyze audio-only affect dimensions (valence, arousal, and dominance)
- Move recordings to trash and restore them

### Observability

- View backend logs and recording activity through the integrated monitoring dashboard.

## API Endpoints

The following table summarizes the main API operations. Recording routes require a valid JWT unless otherwise specified.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |

### Recording Management

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/recordings` | Retrieve recordings |
| POST | `/api/recordings` | Create recording metadata |
| POST | `/api/recordings/upload` | Upload an audio file |
| GET | `/api/recordings/:id` | Retrieve recording details |
| GET | `/api/recordings/:id/file` | Stream an audio file |
| DELETE | `/api/recordings/:id` | Delete a recording |

### Audio Processing and AI

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/recordings/:id/convert` | Convert a recording |
| POST | `/api/recordings/:id/trim` | Trim a recording |
| POST | `/api/recordings/:id/transcribe` | Generate a transcript |
| GET | `/api/recordings/:id/transcript` | Retrieve a saved transcript |
| POST | `/api/recordings/:id/summarize` | Generate an AI summary |
| GET | `/api/recordings/:id/summary` | Retrieve a saved summary |
| POST | `/api/recordings/:id/insights/generate` | Generate meeting intelligence |
| GET | `/api/recordings/:id/insights` | Retrieve saved meeting intelligence |
| POST | `/api/recordings/:id/analyze-audio` | Analyze audio emotion and tone |
| GET | `/api/recordings/:id/audio-analysis` | Retrieve emotion/tone analysis |
| POST | `/api/recordings/:id/analyze-sentiment` | Analyze audio-only affect dimensions |
| GET | `/api/recordings/:id/audio-sentiment` | Retrieve audio sentiment/affect results |

The exact request payloads for audio conversion and trimming depend on the corresponding route implementation. Analysis endpoints operate on recordings owned by the authenticated user.

## Observability Stack

The monitoring pipeline consists of:

1. The Express backend writes application logs.
2. Promtail collects backend log entries.
3. Loki stores and indexes collected logs.
4. Grafana queries Loki and displays monitoring dashboards.
5. The React Observability page provides access to the dashboard.

| Service | Local URL |
|---|---|
| Grafana | `http://localhost:3000` |
| Loki | `http://localhost:3100` |
| Loki readiness check | `http://localhost:3100/ready` |
| Backend health check | `http://localhost:5000/api/health` |

Backend logs are written to `backend/logs/backend.log`.

## Validation

The project has been tested during development for:

- Frontend linting and production builds
- Backend JavaScript syntax and whitespace checks
- Authentication and protected routes
- PostgreSQL connectivity and recording persistence
- Audio upload and playback
- Recording management operations
- WebSocket communication
- Audio conversion and trimming
- Local Whisper transcription
- Local Ollama summarization and meeting intelligence
- Audio emotion and tone analysis
- Audio-only sentiment/affect analysis
- Grafana, Loki, and Promtail integration

Run frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Run backend syntax validation from the backend directory:

```powershell
node --check src/server.js
```

These commands are basic validation checks; they do not replace automated integration or end-to-end testing.

## Security and Model Limitations

The application incorporates JWT authentication, password hashing, protected recording APIs, user ownership checks, file type and size validation, environment-based secrets, cleanup of failed uploads, authentication expiry handling, and Git exclusions for sensitive configuration and runtime data.

AI-generated summaries, meeting action items, emotion labels, tone estimates, and affect scores may be inaccurate. Review results rather than treating them as verified facts about a speaker or meeting. For deployment beyond local development, perform an additional security and privacy review and confirm the license terms for every model used, especially `audeering/wav2small` before commercial use.

## Demo Flow

A recommended demonstration sequence:

1. Start Docker infrastructure.
2. Start the backend and frontend.
3. Ensure Ollama is running.
4. Log in to the application.
5. Record and save audio.
6. Open the Recordings page.
7. Play or download a recording.
8. Search, filter, sort, and rename recordings.
9. Convert a recording and trim an audio segment.
10. Generate a transcript using Whisper.
11. Generate an AI summary using Ollama.
12. Generate meeting insights and review key points, decisions, and action items.
13. Run audio emotion and tone analysis.
14. Run audio-only sentiment/affect analysis and review valence, arousal, and dominance by segment.
15. Demonstrate trash and restore functionality.
16. Open the Observability page and review Grafana logs.

## Future Improvements

Potential enhancements include:

- Cloud deployment and object storage such as AWS S3
- Automated unit, integration, and end-to-end tests
- CI/CD pipeline
- Refresh token support
- Role-based authorization
- Production-grade monitoring and alerting
- Performance optimization for large recordings
- Improved transcript, summary, and insight export options
- Unified visualization and comparison of transcript, meeting, emotion, tone, and affect insights

## Author

**Sourabh Uttarwar**

Full Stack Developer

Technologies demonstrated: React, Node.js, Express, PostgreSQL, REST APIs, WebSocket, JWT, Docker, Grafana, Loki, Promtail, FFmpeg, Python, Whisper, Ollama, PyTorch, and audio-analysis models.
# Design Recorder

A full-stack audio recording, processing, transcription, and AI-powered management application built with **React, Node.js, Express, PostgreSQL, WebSocket, Docker, Grafana, Loki, Promtail, Whisper, and Ollama**.

Design Recorder enables authenticated users to record and manage audio from the browser, process recordings into different formats, trim audio, generate timestamped transcripts, and create AI-powered summaries using locally running AI models. It also includes recording search and organization, persistent storage, and an integrated observability dashboard.

## Demo Videos

### Original Assignment Demo

[▶️ Watch the Original Design Recorder Demo on Loom](https://www.loom.com/share/8ee5034b232d4014934f1c5a8d38892e)

### New Features Demo

[▶️ Watch the New Features Demo on Loom](https://www.loom.com/share/cff0f6c7b7994c5ab155fb10964b86fc)

## Features

### 1. Authentication and Security

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected recording APIs and routes
- User-specific recording access
- Authentication expiry handling
- Logout functionality
- Recording ownership checks
- File type and upload size validation
- Environment-based database credentials and JWT secrets

### 2. Audio Recording and Playback

- Record audio directly through the browser microphone
- Start and stop recording
- Recording timer and status indicators
- Upload and persist recordings
- Play back saved recordings
- Download recordings
- Store recording metadata in PostgreSQL
- Store audio files on the server
- Support for common audio formats

### 3. Recording Management

- Dedicated Recordings page
- Search recordings
- Filter and sort recordings
- Rename recordings
- Delete recordings using soft deletion
- Restore recordings from trash
- View recording metadata and duration
- User-specific recording lists
- Persistent metadata and audio storage

### 4. Audio Conversion

Convert saved recordings into supported audio formats.

- Convert recordings between supported formats
- Generate WAV and MP3 audio files
- Process audio using FFmpeg
- Save converted output as a recording
- Play back converted recordings

### 5. Audio Trimming

Trim recordings to retain only the required portion of the audio.

- Specify a start and end time
- Process the selected audio segment using FFmpeg
- Generate a trimmed audio file
- Save and play back the resulting recording

### 6. AI-Powered Speech-to-Text Transcription

Generate transcripts from saved audio recordings using **Whisper through faster-whisper**, running locally.

- Transcribe audio recordings into text
- Detect the spoken language
- Display language detection confidence
- Generate timestamped transcript segments
- Store transcript results in PostgreSQL
- Retrieve previously generated transcripts
- Reuse saved transcripts rather than transcribing the same recording repeatedly when a cached result is available

Transcription runs locally rather than relying on a paid cloud transcription API.

### 7. Local AI Recording Summaries

Generate summaries of recording transcripts using **Ollama and the `qwen2.5:1.5b-instruct` model**.

- Generate AI-powered summaries from recording transcripts
- Display the generated summary in the application
- Retrieve saved summaries
- Persist summary results for later access
- Run the language model locally
- Avoid dependence on a paid external AI API for summarization

The summary feature builds on the transcription workflow: audio is transcribed first, and the resulting text is used to generate a concise summary.

### 8. Real-Time Communication

The application supports WebSocket communication for recording-related events.

- `recording:start`
- `recording:stop`
- Recording status updates
- Connection events
- Error handling
- Message acknowledgements

WebSocket endpoint:

```text
ws://localhost:5000/ws
```

### 9. Observability and Logging

The project includes a local logging and monitoring pipeline using Grafana, Loki, and Promtail.

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

The monitoring dashboard provides visibility into:

- Backend application logs
- Backend errors
- Recording upload activity
- Recording deletion activity
- WebSocket activity
- Recording events
- Error counts
- Recording activity over time

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, React Router, Vite, JavaScript, Lucide React |
| Audio | MediaRecorder API, browser audio APIs, FFmpeg |
| Backend | Node.js, Express, REST APIs, WebSocket |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| File Uploads | Multer |
| Speech-to-Text | Python, faster-whisper, Whisper |
| Local AI | Ollama, Qwen 2.5 1.5B Instruct |
| Observability | Grafana, Loki, Promtail |
| Infrastructure | Docker, Docker Compose |
| Version Control | Git, GitHub |

## Architecture

```text
                     React Frontend
                    localhost:5173
                           |
              +------------+-------------+
              |            |             |
              v            v             v
           REST APIs    WebSocket    Observability
              |            |             |
              v            v             v
           Node.js + Express         Grafana
           localhost:5000                |
              |                          v
       +------+------+                  Loki
       |             |                    ^
       v             v                    |
   PostgreSQL    Audio Files           Promtail
       |             |                    ^
       |             v                    |
       |         FFmpeg Processing    Backend Logs
       |
       +---- Transcripts
       |
       +---- AI Summaries

 Audio Files
      |
      v
 Whisper / faster-whisper
      |
      v
 Transcript Text
      |
      v
 Ollama / Qwen Model
      |
      v
 Saved AI Summary
```

## Project Structure

The following is a high-level overview of the project structure. Individual files may differ as features evolve.

```text
recorder-portal/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── recordingController.js
│   │   │   └── summaryController.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── recordingRoutes.js
│   │   ├── utils/
│   │   ├── websocket/
│   │   └── server.js
│   ├── python/
│   │   └── transcribe.py
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
- Python 3.13 for the local transcription environment
- FFmpeg for audio conversion and trimming
- Ollama for local AI summarization

Recommended versions for the development environment:

```text
Node.js 24+
npm 11+
PostgreSQL 18+
Python 3.13
Docker Desktop
```

Whisper transcription and Ollama summarization require additional local model dependencies and sufficient system resources.

## Database Setup

Create the application database in PostgreSQL:

```sql
CREATE DATABASE design_recorder;
```

The database stores authenticated users, recording metadata, transcription results, and AI summaries.

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

Additional database structures store transcript segments and AI-generated summaries.

Run the database setup or migration scripts included in the project before using the transcription and summarization features. Recordings are associated with users through `user_id`.

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

Replace the example values with your local configuration. Do not commit `.env` files or real credentials to Git.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Darkcodex-rides/recorder-portal.git
cd recorder-portal
```

### 2. Install backend dependencies

```powershell
cd backend
npm install
```

### 3. Install frontend dependencies

Open a terminal from the project root:

```powershell
cd frontend
npm install
```

### 4. Configure audio processing

Install FFmpeg and ensure the `ffmpeg` executable is available to the backend process through the system `PATH`.

Verify the installation:

```powershell
ffmpeg -version
```

### 5. Configure local transcription

Install Python 3.13 and set up the transcription environment and required Python packages according to the project's transcription script and dependencies.

The transcription implementation uses `faster-whisper` with the Whisper `small` model and CPU `int8` computation.

The first model initialization may require downloading model files.

### 6. Configure local AI summarization

Install Ollama and pull the model used by the project:

```powershell
ollama pull qwen2.5:1.5b-instruct
```

Verify that the model responds:

```powershell
ollama run qwen2.5:1.5b-instruct "Reply with exactly: Local AI is working."
```

Ensure Ollama is running and accessible to the backend when using the summarization feature.

## Running the Application

Run the infrastructure, backend, and frontend in separate terminals.

### 1. Start the observability infrastructure

```powershell
cd infrastructure
docker compose up -d
```

Verify the containers:

```powershell
docker ps
```

The expected services include Loki, Promtail, and Grafana.

### 2. Start the backend

```powershell
cd backend
npm run dev
```

Backend URL:

http://localhost:5000

Health check:

http://localhost:5000/api/health

### 3. Start the frontend

```powershell
cd frontend
npm run dev
```

Frontend URL:

http://localhost:5173

### 4. Start the local AI service

Ensure Ollama is running and the configured Qwen model is available. The Whisper environment must also be configured for transcription.

## Application Pages

### Login

Register an account or log in to access protected application features.

### Dashboard

- Record audio using the browser microphone
- Start and stop recordings
- View recording duration and status
- Save recordings

### Recordings

- Browse saved recordings
- Play and download audio
- Search, filter, and sort recordings
- Rename recordings
- Convert audio to supported formats
- Trim audio
- Generate and view transcripts
- Generate and view AI summaries
- Move recordings to trash and restore them

### Observability

View backend logs and recording activity through the integrated monitoring dashboard.

## API Endpoints

The following endpoints summarize the main API operations. All recording routes require a valid JWT unless otherwise specified.

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

The upload endpoint accepts multipart form data using the `audio` field, with recording name and duration as additional fields.

### Audio Processing and AI

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/recordings/:id/convert` | Convert a recording |
| POST | `/api/recordings/:id/trim` | Trim a recording |
| POST | `/api/recordings/:id/transcribe` | Generate a transcript |
| GET | `/api/recordings/:id/transcript` | Retrieve a saved transcript |
| POST | `/api/recordings/:id/summarize` | Generate an AI summary |
| GET | `/api/recordings/:id/summary` | Retrieve a saved summary |

The exact request payloads for audio conversion and trimming depend on the corresponding route implementation.

## Observability Stack

The monitoring pipeline consists of:

1. The Express backend writes application logs.
2. Promtail collects backend log entries.
3. Loki stores and indexes the collected logs.
4. Grafana queries Loki and displays monitoring dashboards.
5. The React Observability page provides access to the dashboard.

Services:

| Service | Local URL |
|---|---|
| Grafana | http://localhost:3000 |
| Loki | http://localhost:3100 |
| Loki readiness check | http://localhost:3100/ready |
| Backend health check | http://localhost:5000/api/health |

Backend logs are written to:

```text
backend/logs/backend.log
```

## Validation

The project has been tested during development for the following areas:

- Frontend linting and production builds
- Backend JavaScript syntax
- Authentication and protected routes
- PostgreSQL connectivity and recording persistence
- Audio upload and playback
- Recording management operations
- WebSocket communication
- Audio conversion and trimming
- Local Whisper transcription
- Local Ollama summarization
- Grafana, Loki, and Promtail integration

Run the frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

Run backend syntax validation:

```powershell
cd backend
node --check src/server.js
```

These commands are basic validation checks; they do not replace automated integration or end-to-end testing.

## Security Considerations

The application incorporates:

- JWT authentication
- Password hashing with bcrypt
- Protected recording APIs
- User ownership checks
- File type and size validation
- Environment-based secrets and database credentials
- Cleanup of failed uploads
- Authentication expiry handling
- Git exclusions for sensitive configuration and runtime data

For deployment beyond a local development environment, additional security review and production configuration are recommended.

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
12. Demonstrate trash and restore functionality.
13. Open the Observability page and review Grafana logs.

## Future Improvements

Potential enhancements include:

- Cloud deployment and object storage such as AWS S3
- Automated unit, integration, and end-to-end tests
- CI/CD pipeline
- Refresh token support
- Role-based authorization
- Production-grade monitoring and alerting
- Performance optimization for large recordings
- Improved transcript and summary export options

## Author

**Sourabh Uttarwar**

Full Stack Developer

Technologies demonstrated: React, Node.js, Express, PostgreSQL, REST APIs, WebSocket, JWT, Docker, Grafana, Loki, Promtail, FFmpeg, Python, Whisper, and Ollama.
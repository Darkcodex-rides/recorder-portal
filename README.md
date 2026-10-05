# Design Recorder

A full-stack audio recording and management application built with **React, Node.js, Express, PostgreSQL, WebSocket, Docker, Loki, Promtail, and Grafana**.

The application allows authenticated users to record audio from the browser, upload and persist recordings, play them back, delete recordings, and monitor backend activity through an integrated observability dashboard.

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing with bcrypt
- Protected recording APIs
- User-specific recording access
- Automatic authentication expiry handling
- Logout functionality

### Audio Recording

- Browser microphone recording
- Start / stop recording
- Recording timer
- Recording status
- Audio upload
- Audio playback
- Recording metadata persistence
- Recording deletion

### Recording Management

- Dedicated Recordings page
- List authenticated user's recordings
- Recording count
- Audio playback
- Delete recordings
- Persistent PostgreSQL metadata
- Server-side audio file storage

### Real-Time Communication

WebSocket support is implemented for recording events.

Supported events include:

- `recording:start`
- `recording:stop`
- Recording status updates
- Connection events
- Error handling
- Message acknowledgements

### Observability

The project includes a complete local logging and monitoring pipeline:

```text
Backend
   │
   ▼
backend.log
   │
   ▼
Promtail
   │
   ▼
Loki
   │
   ▼
Grafana
   │
   ▼
React Observability Page
```

The Grafana dashboard monitors:

- Backend application logs
- Backend errors
- Recording upload activity
- Recording deletion activity
- Recording events
- WebSocket activity
- Backend error count
- Recording activity over time

---

## Tech Stack

### Frontend

- React
- React Router
- Vite
- Lucide React
- JavaScript
- Web Audio / MediaRecorder APIs

### Backend

- Node.js
- Express
- REST APIs
- WebSocket
- Multer
- JWT
- bcrypt

### Database

- PostgreSQL

### Observability

- Grafana
- Loki
- Promtail

### Infrastructure

- Docker
- Docker Compose

---

## Architecture

```text
                         ┌──────────────────────┐
                         │      React App       │
                         │    localhost:5173    │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
             REST APIs          WebSocket        Grafana
                  │                 │                 │
                  ▼                 ▼                 │
          ┌─────────────────────────────────┐         │
          │       Node.js + Express         │         │
          │        localhost:5000            │         │
          └───────────────┬─────────────────┘         │
                          │                           │
                 ┌────────┴────────┐                  │
                 │                 │                  │
                 ▼                 ▼                  │
          ┌─────────────┐   ┌──────────────┐         │
          │ PostgreSQL  │   │ Audio Files  │         │
          │             │   │              │         │
          │ User +      │   │ recordings/  │         │
          │ Metadata    │   │              │         │
          └─────────────┘   └──────────────┘         │
                                                     │
                          Backend Logs               │
                               │                     │
                               ▼                     │
                          ┌─────────┐                │
                          │Promtail │                │
                          └────┬────┘                │
                               │                     │
                               ▼                     │
                          ┌─────────┐                │
                          │  Loki   │────────────────┘
                          └─────────┘
```

---

## Project Structure

```text
recorder-portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── recordingController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── upload.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── recordingRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   └── logger.js
│   │   │
│   │   ├── websocket/
│   │   │   └── recordingSocket.js
│   │   │
│   │   └── server.js
│   │
│   ├── recordings/
│   ├── logs/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── infrastructure/
│   ├── docker-compose.yml
│   ├── loki/
│   ├── promtail/
│   └── grafana/
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Install the following:

- Node.js
- npm
- PostgreSQL
- Docker Desktop
- Git

Recommended environment:

```text
Node.js 24+
npm 11+
PostgreSQL 18+
Docker Desktop
```

---

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE design_recorder;
```

The application uses two primary tables:

### users

Stores authenticated user information.

```text
id
name
email
password_hash
created_at
```

### recordings

Stores recording metadata.

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
```

Recordings are associated with users through `user_id`.

---

## Environment Variables

Create:

```text
backend/.env
```

Example:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=design_recorder
DB_PASSWORD=your_postgres_password
DB_PORT=5432

JWT_SECRET=your_secure_jwt_secret
```

Do not commit `.env` to Git.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Darkcodex-rides/recorder-portal.git
cd recorder-portal
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Application

The project consists of three services:

```text
Infrastructure
Backend
Frontend
```

### 1. Start Infrastructure

Open a terminal:

```powershell
cd infrastructure
docker compose up -d
```

Verify:

```powershell
docker ps
```

Expected containers:

```text
recorder-loki
recorder-promtail
recorder-grafana
```

### 2. Start Backend

Open another terminal:

```powershell
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 3. Start Frontend

Open another terminal:

```powershell
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Application Pages

### Login

Users authenticate using email and password.

### Dashboard

The Dashboard contains the audio recorder.

Users can:

- Start recording
- Stop recording
- Monitor recording duration
- Save the recording

### Recordings

The Recordings page contains the user's saved recordings.

Users can:

- View recordings
- Play recordings
- Delete recordings

### Observability

The Observability page embeds the Grafana monitoring dashboard.

It provides visibility into:

- Backend logs
- Errors
- Upload activity
- Delete activity
- WebSocket activity
- Recording events

---

## API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

Example:

```json
{
  "name": "Sourabh",
  "email": "sourabh@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "sourabh@example.com",
  "password": "password123"
}
```

---

### Recordings

All recording endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

#### Get recordings

```http
GET /api/recordings
```

#### Create recording metadata

```http
POST /api/recordings
```

#### Upload recording

```http
POST /api/recordings/upload
```

Multipart field:

```text
audio
```

Additional fields:

```text
name
duration
```

#### Get recording

```http
GET /api/recordings/:id
```

#### Stream recording file

```http
GET /api/recordings/:id/file
```

#### Delete recording

```http
DELETE /api/recordings/:id
```

---

## WebSocket

WebSocket endpoint:

```text
ws://localhost:5000/ws
```

Example event:

```json
{
  "type": "recording:start"
}
```

Server response:

```json
{
  "type": "recording:status",
  "status": "Recording",
  "message": "Recording started"
}
```

Stop event:

```json
{
  "type": "recording:stop"
}
```

---

## Observability Stack

Start the monitoring stack:

```powershell
cd infrastructure
docker compose up -d
```

### Grafana

```text
http://localhost:3000
```

### Loki

```text
http://localhost:3100
```

### Loki health

```text
http://localhost:3100/ready
```

Logs generated by the backend are written to:

```text
backend/logs/backend.log
```

Promtail collects these logs and sends them to Loki.

Grafana then visualizes the logs through the Design Recorder monitoring dashboard.

---

## Validation

### Frontend lint

```bash
cd frontend
npm run lint
```

### Frontend production build

```bash
npm run build
```

### Backend syntax validation

```bash
node --check src/server.js
```

The project has been validated with:

- Frontend lint
- Frontend production build
- Backend JavaScript syntax checks
- Authentication testing
- Database testing
- Recording upload testing
- Recording playback testing
- Recording deletion testing
- WebSocket testing
- Logging testing
- Grafana/Loki/Promtail testing

---

## Security Considerations

The application includes:

- JWT authentication
- Password hashing with bcrypt
- Protected recording endpoints
- User ownership checks
- File type validation
- File size limits
- Environment-based database credentials
- Environment-based JWT secret
- Automatic cleanup of failed uploads
- Authentication expiry handling

The `.env`, recordings, logs, and infrastructure runtime data are excluded from Git.

---

## Demo Flow

A recommended demonstration flow:

```text
1. Start Docker infrastructure
2. Start backend
3. Start frontend
4. Login
5. Open Dashboard
6. Start microphone recording
7. Stop recording
8. Open Recordings
9. Play the saved recording
10. Delete a recording
11. Open Observability
12. Show Grafana logs and recording activity
```

---

## Future Improvements

Potential future improvements include:

- Cloud object storage such as AWS S3
- Production deployment
- Refresh token support
- Role-based authorization
- Recording search and filtering
- Pagination
- Recording download
- Recording duration analytics
- Automated tests
- CI/CD pipeline
- Dockerization of the complete application
- Production-grade monitoring and alerting

---

## Author

**Sourabh Uttarwar**

Full Stack Developer

Technologies demonstrated in this project:

```text
React
Node.js
Express
PostgreSQL
REST APIs
WebSocket
JWT
Docker
Loki
Promtail
Grafana
```
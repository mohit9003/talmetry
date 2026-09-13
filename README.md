Talmetry

Measure Talent. Hire Smarter.

Talmetry is an AI-powered recruitment and interview platform that connects candidates and recruiters through intelligent job matching, resume analysis, and AI-assisted interviews.

Features

Candidate

Secure registration and login

Profile and skills management

Resume upload

AI resume analysis and ATS-style scoring

Skill extraction

Recommended jobs and matching

Job applications and status tracking

AI interview evaluation

Interview history

Notifications

Recruiter

Secure registration and login

Company/job management

Required skills and experience

Applicant management

Candidate profile and resume review

Candidate/job matching

Application status management

Recruitment analytics

Technology Stack

Layer

Technology

Frontend

React, JavaScript, Vite

Backend

Java 17, Spring Boot

AI Service

Python, FastAPI

Database

PostgreSQL

Authentication

JWT, BCrypt

ORM

Spring Data JPA / Hibernate

Resume Processing

PDF/DOCX extraction, Tesseract OCR

Containerization

Docker, Docker Compose

Communication

REST APIs

Architecture

React + Vite Frontend
        |
        | REST APIs
        v
Java + Spring Boot Backend -----> PostgreSQL
        |
        | AI APIs
        v
Python + FastAPI AI Service

Project Structure

Talmetry/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
├── ai-service/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore

Local Setup

Prerequisites

Node.js 22+

Java 17+

Python 3.11+ if running the AI service outside Docker

Docker Desktop

Git

Frontend environment

Create frontend/.env:

VITE_API_URL=http://localhost:8080
VITE_AI_URL=http://localhost:8000

The frontend reads these through src/api.js.

Run with Docker

From the project root:

docker compose up -d --build

Check services:

docker compose ps

Open:

Frontend:  http://localhost:5173
Backend:   http://localhost:8080
AI Docs:   http://localhost:8000/docs

Environment Variables

Frontend

VITE_API_URL=http://localhost:8080
VITE_AI_URL=http://localhost:8000

Backend

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/talmetry_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<your-password>
JWT_SECRET=<your-secret>
AI_SERVICE_URL=http://localhost:8000
CORS_ALLOWED_ORIGIN=http://localhost:5173

In Docker, the backend reaches the AI service at:

http://ai-service:8000

Never commit production passwords, JWT secrets, or other credentials.

AI Service

Resume Analysis

POST /api/analyze-resume

Provides document text extraction, OCR fallback, skill extraction, and ATS-style analysis using the implemented AI-service logic.

Interview Evaluation

POST /api/evaluate-interview

Evaluates interview responses and returns the implemented score and feedback data.

Authentication

Talmetry uses JWT-based authentication.

Register/Login
     ↓
Spring Boot authentication
     ↓
JWT token
     ↓
Frontend
     ↓
Authorization: Bearer <token>
     ↓
Protected APIs

Passwords are hashed with BCrypt.

Core API Endpoints

Authentication

POST /api/auth/register
POST /api/auth/login

Jobs

GET    /api/jobs
GET    /api/jobs/{id}
GET    /api/jobs/recruiter/{recruiterId}
GET    /api/jobs/recommended/{userId}
POST   /api/jobs
PUT    /api/jobs/{id}
DELETE /api/jobs/{id}

Applications

GET  /api/applications/user/{userId}
GET  /api/applications/job/{jobId}
POST /api/applications/apply
PUT  /api/applications/{applicationId}/status

Candidate

GET /api/candidate/profile/{id}
GET /api/candidate/resume/{id}
GET /api/candidate/resume-analysis/{resumeId}

Interviews

POST /api/interviews/create
GET  /api/interviews/user/{userId}

Recruiter Analytics

GET /api/recruiter/analytics

Notifications

GET /api/notifications
PUT /api/notifications/{id}/read
PUT /api/notifications/read-all

Docker Services

Service

Port

Frontend

5173

Backend

8080

AI Service

8000

PostgreSQL

5432

Useful commands:

docker compose up -d --build
docker compose ps
docker compose logs backend --tail=100
docker compose logs frontend --tail=100
docker compose logs ai-service --tail=100
docker compose down

Build Checks

Frontend:

cd frontend
npm install
npm run build

Backend on Windows:

cd backend
mvnw.cmd -DskipTests package

Deployment

Talmetry is designed so frontend, backend, AI service, and database can be deployed independently.

For production configure:

VITE_API_URL=<production-backend-url>
VITE_AI_URL=<production-ai-service-url>
AI_SERVICE_URL=<production-ai-service-url>
CORS_ALLOWED_ORIGIN=<production-frontend-url>

Use the hosting provider's secret/environment-variable settings for production credentials.

Security

JWT authentication protects secured APIs.

BCrypt is used for password hashing.

Bearer tokens are sent by protected frontend requests.

Candidate and recruiter workflows are role-separated.

Recruiter ownership checks protect recruiter resources.

Production CORS should allow only the deployed frontend origin.

Production secrets must not be committed to GitHub.

Future Enhancements

Semantic resume/job matching with embeddings

LLM-powered interview question generation

Voice/video interviews

Advanced candidate ranking

Email notifications

Calendar integration

Cloud resume storage

CI/CD pipeline

Automated unit and integration testing

Project Goal

Talmetry reduces manual recruitment effort by combining recruitment workflows with AI-assisted resume analysis, candidate-job matching, and interview evaluation.

Measure Talent. Hire Smarter.

License

Add your preferred license before public release.
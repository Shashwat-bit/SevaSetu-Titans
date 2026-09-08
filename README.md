# SevaSetu — Citizen-Facing Government Services Interoperability Platform

SevaSetu is an interoperability layer that bridges citizen needs with government departmental systems without replacing existing backend ERPs or legacy databases. It provides a privacy-first consent management workflow, pre-filled verified credentials via simulated DigiLocker interoperability adapters, and automated audit logging.

---

## Architecture Overview

```
SevaSetu/
├── src/                          # Citizen-Facing React + Vite + TypeScript Frontend
│   ├── components/               # Reusable UI components & navigation
│   ├── pages/                    # 6 Main Tabs (Dashboard, Services, Applications, Activity, Consent, Profile)
│   ├── services/
│   │   ├── api/                  # REST API client layer connecting to backend
│   │   ├── adapterStore.ts       # Central store with MongoDB backend sync & offline fallback
│   │   └── departmentAdapters.ts # Client adapter specifications
│   └── types/                    # Core TypeScript interfaces
│
├── backend/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/               # Database (Mongoose) and environment settings
│   │   ├── models/               # MongoDB Schemas (Users, Depts, Services, Apps, Docs, Consents, Activities)
│   │   ├── adapters/             # Interoperability adapters (DigiLocker, Education, Revenue, Transport, Welfare)
│   │   ├── services/             # Business logic layer
│   │   ├── controllers/          # REST API Controllers
│   │   ├── routes/               # Express REST Routes
│   │   ├── middleware/           # Centralized error & 404 handlers
│   │   ├── utils/                # Logger & Safe Demo Dataset Seeder
│   │   └── server.ts             # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── MongoDB (Local / Atlas)
    ├── Users
    ├── Departments
    ├── Services
    ├── Applications
    ├── Documents
    ├── Consents
    └── Activities
```

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on v20.18.0)
- **MongoDB**: v6+ (tested on MongoDB Server v7.0.9 running on `mongodb://127.0.0.1:27017`)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Seed MongoDB with pristine demo data
npm run seed

# Build backend
npm run build

# Start backend server (runs on port 5000)
npm run start
# Or for development:
npm run dev
```

### 3. Frontend Setup
```bash
# From workspace root
npm install

# Build frontend
npm run build

# Start development server
npm run dev
```
Open `http://localhost:5173` (or the port shown in terminal) to view the application.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and MongoDB connection status |
| `GET` | `/api/services` | Retrieve list of government services |
| `GET` | `/api/services/:id` | Retrieve service details by ID |
| `GET` | `/api/departments` | Retrieve registered departments |
| `GET` | `/api/departments/:id` | Retrieve department details |
| `GET` | `/api/applications` | Retrieve user applications |
| `POST` | `/api/applications` | Submit application (dispatches via adapter, creates consent & audit) |
| `GET` | `/api/applications/:id` | Retrieve application details & status |
| `PUT` | `/api/applications/:id` | Advance application status (records audit log) |
| `GET` | `/api/applications/:id/timeline` | Retrieve application progression timeline |
| `GET` | `/api/documents` | Retrieve verified mock credentials |
| `POST` | `/api/documents/sync` | Synchronize credentials with mock DigiLocker adapter |
| `POST` | `/api/documents/:id/verify` | Verify cryptographic credential hash |
| `GET` | `/api/consents` | List citizen active & revoked consent records |
| `POST` | `/api/consents` | Grant new granular consent permission |
| `POST` | `/api/consents/:id/revoke` | Revoke department data access |
| `GET` | `/api/activities` | Chronological audit trail of all platform events |
| `GET` | `/api/users/me` | Current citizen profile |
| `POST` | `/api/users/me/connect-digilocker` | Connect mock DigiLocker node |
| `POST` | `/api/users/me/disconnect-digilocker` | Disconnect mock DigiLocker node |
| `POST` | `/api/seed` | Reset demo dataset to initial state |

---

## Interoperability & Mock Layer

- **DigiLocker Integration**: Simulated via `MockDigiLockerAdapter` providing verified mock payloads (Class XII Marksheet, Aadhaar e-KYC, Electricity Bill, Income Self-Declaration) with cryptographic signature simulation.
- **Department Adapters**: Standardized via `IDepartmentAdapter` and implemented for Education (`EDU-GOV`), Revenue (`REV-GOV`), Transport (`RTO-GOV`), and Social Welfare (`WEL-GOV`).
- **Data Privacy**: No citizen sensitive documents are stored; only reference tokens, credential hashes, and normalized metadata are exchanged.

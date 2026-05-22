<p align="center">
  <img src="./logo.png" alt="FlowHire AI Logo" width="180" />
</p>

# FlowHire AI 🧠💼
### AI-Assisted Recruitment Workflow Platform

FlowHire AI is a premium, feature-rich recruitment tracking and candidate evaluation dashboard. It helps recruitment teams organize pipelines, schedule interviews, submit scorecard evaluations, and instantly generate AI summaries and candidate recommendations using **Google Gemini AI**.

---

## ✨ Features

- **🔒 Workspace Authentication**: Secure Login and Register screens supporting role-based access (`Recruiter` and `Interviewer`).
- **📊 Recruiter Dashboard**: High-level KPI cards tracking candidate counts, active stages, hiring success rates, and a searchable candidate roster.
- **📋 Kanban Pipeline Board**: Visual swimlanes representing recruitment stages (Applied ➜ Screening ➜ Tech Interview ➜ Mgmt Interview ➜ Offer ➜ Hired ➜ Rejected) with one-click stage transitions.
- **🔍 Candidate Dossiers**: A single, unified candidate profile containing their parsed resume text, active interview lists, and scorecard evaluations.
- **🤖 AI Insights Panel**: Integrates with Gemini AI to generate executive summaries, list key strengths, note candidate red flags/gaps, and compute match scores (0-100%).
- **📈 Hiring Analytics**: Dynamic metrics display including circular/radial SVG charts for recommendation match averages and funnel stage breakdown graphs.
- **💎 Rich Aesthetics**: Sleek modern layout styled with Tailwind CSS v4, Outfit & Plus Jakarta Sans typography, glassmorphism panels, and smooth micro-animations.

---

## 🛠️ Technology Stack

- **Frontend**: React (v19), TypeScript, Vite (v8), Tailwind CSS (v4), Axios, Lucide React icons.
- **Backend**: Node.js, Express, JWT, Bcrypt.
- **ORM & Database**: Prisma client mapping to a Supabase PostgreSQL instance.
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`).

---

## 📂 Project Structure

```
FlowHire/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL Schema Definition
│   │   └── seed.ts         # Seed script for mock candidate rosters
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts     # JWT Authorization middleware
│   │   ├── routes/
│   │   │   ├── auth.ts       # Register, Login endpoints
│   │   │   ├── candidates.ts # Candidate CRUD and stage transitions
│   │   │   ├── interviews.ts # Interview schedule workflows
│   │   │   ├── evaluations.ts# Scorecard submissions
│   │   │   └── ai.ts         # Gemini AI Analysis router
│   │   └── index.ts        # Express Application entrypoint
│   ├── .env                # Port, Database URL, JWT secret, Gemini Key
│   └── tsconfig.json       # TypeScript configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.tsx # Navigation Sidebar
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Global authorization state
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Pipeline.tsx
│   │   │   ├── CandidateProfile.tsx
│   │   │   └── Analytics.tsx
│   │   ├── services/
│   │   │   └── api.ts       # Axios client with interceptors
│   │   ├── App.tsx          # Route definitions
│   │   └── index.css        # Tailwind imports and premium styles
│   ├── tailwind.config.js   # Content detection mapping
│   └── package.json         # Scripts and dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@host:port/database"
   JWT_SECRET="your-jwt-signing-secret"
   GEMINI_API_KEY="AIzaSy..."
   ```
4. Push the schema to the database and generate Prisma Client:
   ```bash
   npx prisma db push
   ```
5. Seed mock candidate data:
   ```bash
   npm run db:seed
   ```
6. Start the Express development server:
   ```bash
   npm run dev
   ```
   *The backend should run successfully on `http://localhost:5000`.*

---

### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to view the application.*

---

## 🔑 Test Workspace Access

To explore the dashboard immediately without registering a new account, use these default credentials:
- **Email**: `sarah@flowhire.ai`
- **Password**: `password123`
- **Role**: `Recruiter`

<div align="center">

# 🌍 EcoPulse

### Cinematic AI-Verified Sustainability Platform

**Zero-Friction · Gamified · Behaviorally Intelligent**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-orange?logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-yellow?logo=firebase)](https://firebase.google.com)
[![Framer Motion](https://img.shields.io/badge/Framer-Motion-purple?logo=framer)](https://www.framer.com/motion)

**Live Deployment:** [https://ecopulse-app.web.app/](https://ecopulse-app.web.app/)

</div>

---

## 🧠 The Problem

> **"The Verification Gap"** — Sustainability platforms rely on the honor system, making gamification meaningless.

Existing carbon tracking applications fail because:
- **Self-reporting is easily gamified.** Users log "biked to work" while sitting on their couch just to earn points.
- **Generic tracking is boring.** A simple form to input distance traveled does not build habits.
- **Data lacks personalization.** Users don't know *what* specific actions actually help their carbon footprint.

**EcoPulse** solves these issues through real-time AI computer vision and deep gamification.

## 🚀 What's New in Version 6.0

Version 6.0 introduces a massive overhaul to our AI infrastructure, focusing on speed, accuracy, and enterprise-grade code quality:
- **Two-Step "Split-Brain" AI Architecture:** We decoupled the vision and text generation workloads. A hyper-fast Groq Vision model (Llama 4 Scout) now handles the mathematical confidence scoring and visual detection, while Gemini 2.5 Flash takes that data to generate the cinematic terminal reports. This completely eliminated API timeouts and hallucinated scores.
- **Automated Unit Testing (Vitest):** Integrated Vitest and React Testing Library to mathematically prove our UI components and Zustand state logic. The `AIVerificationModal` now includes comprehensive headless tests with mocked webcam APIs.
- **Full Semantic Accessibility (ARIA):** Achieved a 100/100 accessibility score by implementing dynamic `aria-live` regions for the terminal logs, `role="progressbar"` for the confidence gauges, and extensive semantic tagging for screen readers (VoiceOver/NVDA).

### 🔥 6.0 Enterprise Code Quality & Polish
- **Strict Quality Gates**: Integrated `husky` pre-commit hooks and `lint-staged` to enforce ESLint and strict Vitest compliance *before* any code hits the repository.
- **Coverage Enforcement**: Configured `@vitest/coverage-v8` with strict >80% code coverage thresholds required for CI pipeline success.
- **Structured Observability**: Built a custom `Logger` class to replace generic console logs with production-grade JSON telemetry formatting.
- **Next.js SEO & Static Export Purity**: Configured native `robots.ts` and `sitemap.ts` for Crawler ingestion. Actively removed all Next.js API routes (`app/api/*`) to fully optimize the build for a pure Firebase Static Export without compilation crashes.
- **Graceful UI Degradation**: Wrapped the `layout.tsx` providers in a formal React `ErrorBoundary` to prevent white screens during fatal runtime exceptions.

### 🤖 6.0 Recent AI Architecture Upgrades
- **Groq Llama 4 Scout Transition:** Replaced the decommissioned `llama-3.2-11b-vision-preview` with Groq's natively multimodal `llama-4-scout-17b-16e-instruct`, enforcing strict `json_object` response formats to prevent parsing crashes.
- **Gemini 2.5 Flash Integration:** Upgraded the fallback text generation engine from the deprecated `gemini-1.5-flash` to the current stable `gemini-2.5-flash` endpoint on Google's free tier.
- **Mathematical Guardrails:** Added strict clamping limits (`Math.min(100, Math.max(0, points))`) directly in the parsing pipeline to prevent the AI from accidentally corrupting the global leaderboard economy.
- **Next.js Static Export Optimization:** Configured `output: 'export'` to completely eliminate server-side rendering latency, making the app load instantly on Firebase Hosting.

---

## ✨ What is EcoPulse?

EcoPulse is a **serverless sustainability platform** that:

1. **Eliminates fraudulent logging** — The platform utilizes **"Proof of Action"**. Users must snap a live photo of their eco-action (e.g., a bus ticket, a reusable cup, recycling). Google's Gemini Vision AI audits it in real-time.
2. **Builds behavioral retention** — A sophisticated gamification engine tracks "EcoPoints", dynamic streaks, and geo-hashed neighborhood leaderboards.
3. **Provides cinematic feedback** — The UI uses premium glassmorphism, Framer Motion micro-interactions, and a glowing terminal interface to make the user feel like they are operating a sci-fi command center for Earth.

---

## 🎮 The Gamification Engine

EcoPulse uses a closed-loop economy of actions and rewards to drive behavior.

### 1. Proof of Action (AI Verification)
When a user claims to have completed a task (e.g., "Public Transit"), the platform activates the device camera.
- The captured frame is sent to **Gemini 2.0 Flash**.
- The AI runs a Bayesian confidence analysis to verify the image matches the claim.
- If `action_verified == true`, the AI computes the exact `co2_delta_kg` saved and awards EcoPoints.

### 2. The Points Ledger
```javascript
// Dynamic Reward Scaling
Reward = Base_Points(10-50) * Confidence_Score * Action_Difficulty
```
Points are securely logged to a Firestore ledger and aggregated into the user's total balance. These points can be spent in the **EcoMarketplace** on partner rewards.

### 3. Dynamic Streaks & Badges
- **Streaks:** Logging any action within a 24-hour window increments the user's streak.
- **Badges:** As users hit milestones (e.g., 100kg CO₂ saved, 7-day streak), the system automatically unlocks cinematic badges in their profile.

---

## 🛠️ Architecture

EcoPulse is a **Serverless Monolith** leveraging Next.js App Router for the client and Firebase for the backend/database.

```text
[ React 18 Frontend (Next.js App Router / Framer Motion) ]
          │ 
          ▼
┌─────────────────────────────────────────────────────┐
│                 Client-Side AI Layer                │
│  - Captures 640x480 webcam frames                   │
│  - Executes Base64 encoding                         │
│  - Round-robin API key rotation to bypass limits    │
│  - Direct REST call to Gemini 2.0 Flash             │
└─────────────────────────────────────────────────────┘
          │                         │
  [ Gamification ]          [ Data Layer ]
  - zustand (State)         - firestore.ts (DB access)
  - react-query (Cache)     - auth.ts (OAuth/Email)
          │                         │
          └──────────┬──────────────┘
                     ▼
             [ Firebase Cloud ]
             - Authentication
             - Firestore (NoSQL)
             - Hosting (Static Export)
```

> **Design Decision:** By pushing the Gemini Vision inference directly to the edge/client and utilizing Firebase SDKs, EcoPulse operates with **zero backend server costs**. This allows infinite scaling during high-traffic events.

---

## 🤖 The AI Pipeline — Vision Auditing

Every action claim goes through a strict **confidence-gated pipeline**:

```text
User Claims Action -> Opens Viewfinder -> Captures Frame
         │
         ▼
  [Client Preprocessing]
  - Canvas downscales to 640x480
  - JPEG compress at 80% quality (Target: <50KB)
         │
         ▼
  [Gemini API Round-Robin Load Balancer]
  - Tries gemini-2.5-flash-lite -> gemini-2.5-flash
  - Automatically rotates API keys on HTTP 429 (Rate Limit)
         │
         ▼
    confidence_score ≥ 0.8?
    ┌────────────────────────┐
    │ YES → VERIFIED         │ NO → REJECTED
    └────────────────────────┘
         │
         ▼
  [Firestore Transaction]
  - userStats.co2Saved += ai_computed_delta
  - pointsLedger.add(ai_computed_points)
```

---

## 🌍 Data Structure (Firestore NoSQL)

EcoPulse relies on a highly partitioned database architecture to ensure rapid querying:

```text
users/
  {userId}/
    trips/            → mode, distance_km, co2e_kg, recorded_at
    actions/          → description, co2SavedKg, points, completedAt
    points_ledger/    → delta, reason, created_at
    streaks           → current_streak, longest_streak, last_activity
    badges/           → badge_id, earned_at
```

**Optimized Aggregation:** The Profile page utilizes `@tanstack/react-query` to pull from these subcollections. We use Firestore's native `getAggregateFromServer` with `sum('delta')` to compute users' total EcoPoints server-side with zero document reads overhead, drastically reducing Firebase read costs. `stale-while-revalidate` caching ensures that when a user completes an AI action and returns to their profile, the UI updates instantly without blocking loaders.

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- A [Firebase Project](https://console.firebase.google.com/)
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- A [Groq API key](https://console.groq.com/keys) (For Llama 4 Scout Vision)

### 1. Clone and Install
```bash
git clone https://github.com/DevRexxxx/EcoPulse.git
cd EcoPulse
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Firebase Web Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Architecture Keys
NEXT_PUBLIC_GROQ_API_KEY=your_groq_key
# Gemini API Keys (Comma-separated for automated round-robin rotation)
NEXT_PUBLIC_GEMINI_API_KEYS=key1,key2,key3
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deploy to Firebase Hosting

EcoPulse is configured for `output: 'export'`, making it incredibly cheap and fast to host on Firebase's global CDN.

```bash
# 1. Build the static production bundle
npm run build

# 2. Deploy to Firebase
npx firebase deploy --only hosting
```

---

## 🌐 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Vanilla CSS (`globals.css`) + CSS Variables (Glassmorphism) |
| Animation | Framer Motion 11 |
| AI | Google Gemini 2.0 Flash (`REST API`) |
| State Management| Zustand (Global) + React Query (Server State) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Charts | Recharts |

---

<div align="center">

Built for the future. 
*"Gamification without verification is just a spreadsheet. EcoPulse makes it a mission."*

<br />

`© 2026 Eshaan Singh Deo | All Rights Reserved`

</div>

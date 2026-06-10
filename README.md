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

## 🚀 What's New in Version 3.0

Version 3.0 is a massive architectural and visual overhaul of the platform:
- **Cinematic Command Center:** Replaced the generic dashboard with a sci-fi inspired "Operator Terminal" featuring live network rankings and real-time telemetry.
- **AI "Proof of Action" Scanner:** A new live viewfinder that captures images, compresses them client-side, and utilizes Gemini 2.0 Flash to verify eco-friendly actions (transit, recycling, meals) with high confidence.
- **Automated Point Economy:** The Action feed now connects directly to the Firestore database. Completing actions or getting an AI scan approved now instantly updates your CO₂ mitigation and trips logged in real-time.
- **Zero-Latency Data Layer:** Transitioned from a heavy REST API backend to direct, client-side Firebase SDKs, allowing for 0ms optimistic UI updates.

### 🔥 3.1 Recent Architecture Upgrades
- **Dedicated Report Dashboard:** A beautifully styled, dynamic `/actions/report` dashboard that acts as the final screen for both Accepted AND Rejected AI scans. Shows exactly why an action was verified or denied.
- **Native PDF Generation:** Built-in ability to instantly download the official cryptographic proof and terminal analysis as an A4 PDF document without relying on heavy third-party libraries.
- **Gemini 2.5 Flash Transition & Round-Robin Load Balancing:** Optimized the API configuration to use the cutting-edge `gemini-2.5-flash` model. The integration natively parses environment variables to seamlessly load-balance requests across multiple API keys, catching rate limits and broken keys, and instantly failing over to backup keys.
- **Silent WebSockets (Adblock Bypass):** Stripped the default Firebase `experimentalForceLongPolling` HTTP polling strategy in favor of pure native WebSockets, which prevents browser Adblockers from spamming `ERR_BLOCKED_BY_CLIENT` and ensures silent, robust realtime connections.

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

**Optimized Aggregation:** The Profile page utilizes `@tanstack/react-query` to pull from these subcollections instantly. `stale-while-revalidate` caching ensures that when a user completes an AI action and returns to their profile, the UI updates instantly without blocking loaders.

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- A [Firebase Project](https://console.firebase.google.com/)
- A [Gemini API key](https://aistudio.google.com/app/apikey)

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

# 🌍 EcoPulse: AI-Driven Carbon Tracking Platform

**Live Deployment:** [https://ecopulse-app.web.app/](https://ecopulse-app.web.app/)

![Version](https://img.shields.io/badge/version-3.0.0-00F2A6?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

EcoPulse is a mobile-first, AI-driven carbon tracking and behavior-change platform. It gamifies sustainability by allowing users to log eco-friendly actions, track their carbon mitigation, and earn "EcoPoints" redeemable for rewards.

Version 3.0 introduces a state-of-the-art cinematic **Command Center Dashboard** and **AI-Verified "Proof of Action"**, utilizing Google's Gemini Vision models to audit and verify user submissions in real-time.

---

## 🏛️ System Architecture

EcoPulse is designed around a three-tier architecture with an intelligent AI inference layer bridging the client and the data layer. 

### 1. Subsystem Breakdown
- **Tracking Engine:** Parses manual and detected trips to build an emissions timeline. Runs inputs through a dynamic emissions calculator to convert distances/modes into `kg CO2e` deltas.
- **Action Engine (AI):** Replaces static suggestions with hyper-personalized micro-habits. It utilizes the **Google Gemini REST API** directly on the client for low-latency image auditing and "Proof of Action" verification.
- **Gamification Layer:** Manages the "EcoPoints" ledger, dynamic badge unlocking, and radius-based Geohashed neighborhood leaderboards.
- **Data Pipeline:** Stores, aggregates, and serves time-series emissions data. Highly optimized to fetch bounded timelines (e.g., 14-day history) rather than polling entire collections, ensuring instant dashboard loads.

### 2. MVP to Production Evolution
While the initial architectural spec (`ecopulse_architecture.md`) envisioned a Python FastAPI backend with PostgreSQL, the **V3.0 implementation** pivots to a highly scalable, serverless stack using **Next.js (App Router)** and **Firebase (Firestore + Auth)**. This eliminates backend latency, reduces server costs to zero via static exports, and allows Gemini Vision inference to occur securely on the edge/client.

---

## 💻 Tech Stack & Implementation

### Frontend (Client Layer)
- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Custom "Cinematic Glassmorphism" system using Vanilla CSS variables (`globals.css`), eliminating utility-class clutter.
- **State Management:** `Zustand` for global user state (streaks, points) and standard React hooks for component state.
- **Data Visualization:** `Recharts` for interactive, gradient-filled carbon area graphs.
- **Micro-interactions:** `Framer Motion` powers the staggered Bento Grid entrances and animated telemetry counters.

### Backend & Data (Firebase)
- **Authentication:** Firebase Auth (Email/Password & Google OAuth).
- **Database:** Cloud Firestore (NoSQL). Collections are strictly partitioned by user (`users/{userId}/trips`, `users/{userId}/points_ledger`) to ensure deep data isolation.
- **Hosting:** Firebase Hosting (optimized for Next.js static `output: 'export'`).

### AI Inference
- **Google Gemini 2.0:** Integrates `gemini-2.0-flash` and `gemini-2.0-flash-lite` via REST. The `AIVerificationModal` component features an automated failover system that rotates API keys and models to bypass strict 15 RPM rate limits.

---

## 📂 Codebase Structure

- **`src/app/(app)/`**: Authenticated routes layout.
  - **`dashboard/page.tsx`**: Main Command Center featuring the Bento Grid layout.
  - **`actions/page.tsx`**: The Action Feed and AI Verification portal.
  - **`leaderboard/page.tsx`**: The neighborhood sector grid rankings.
  - **`rewards/page.tsx`**: EcoMarketplace point redemption.
- **`src/components/verify/AIVerificationModal.tsx`**: The core AI logic engine handling image capture, Base64 conversion, Gemini prompt engineering, and JSON parsing.
- **`src/lib/firestore.ts`**: The unified database access layer. Handles optimized querying (e.g., `where` clauses on timestamps) and atomic point deductions.
- **`src/lib/mock/`**: Contains deterministic mock engines for rewards, leaderboards, and baseline emission factors.

---

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DevRexxxx/EcoPulse.git
   cd EcoPulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Gemini API Keys (Comma-separated for automated round-robin rotation)
   NEXT_PUBLIC_GEMINI_API_KEYS=key1,key2,key3
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment

The project is configured for static export. To deploy to Firebase Hosting:

```bash
# 1. Build the static production bundle
npm run build

# 2. Deploy to Firebase Hosting
npx firebase deploy --only hosting
```

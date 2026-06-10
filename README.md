# 🌍 EcoPulse

**Live Deployment:** [https://ecopulse-app.web.app/](https://ecopulse-app.web.app/)

![Version](https://img.shields.io/badge/version-3.0.0-00F2A6?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

EcoPulse is a Next.js (App Router) based carbon tracking and behavior-change platform. It utilizes Google's Gemini Vision models directly on the client side to audit and verify user submissions in real-time, backed by Firebase for authentication and database storage.

## 📂 Codebase Structure

### `src/app/` (Next.js App Router)
- **`/(app)/`**: Authenticated routes layout.
  - **`dashboard/page.tsx`**: The main "Command Center" dashboard featuring a cinematic Bento Grid layout, animated telemetry metrics, and Recharts integration.
  - **`actions/page.tsx`**: Displays personalized eco-suggestions and hosts the `AIVerificationModal` for users to submit proof of their actions.
  - **`leaderboard/page.tsx`**: Renders the "Sector Grid" leaderboard comparing users by their accumulated EcoPoints.
  - **`rewards/page.tsx`**: Allows users to redeem EcoPoints for sustainable brand discounts.
- **`/auth/page.tsx`**: Firebase authentication entry point.
- **`globals.css`**: The core styling engine. Contains over 1,700 lines of CSS defining the cinematic glassmorphism design system, CSS variables, dark mode color palettes, and staggered animations.

### `src/components/`
- **`verify/AIVerificationModal.tsx`**: The core AI component. Captures webcam photos or file uploads, connects to the Gemini 2.0 Flash / Flash-Lite REST APIs, parses the JSON response, and manages rate-limit/key-rotation fallbacks.
- **`dashboard/`**: Contains sub-components for the dashboard like `CarbonGraph.tsx` and `RecentTrips.tsx`.
- **`layout/`**: Contains `Header.tsx`, `Sidebar.tsx`, and `BottomNav.tsx`.

### `src/lib/`
- **`firestore.ts`**: Handles all Firebase interactions including fetching emissions history (with optimized date queries), logging trips, updating streaks, and managing the points ledger.
- **`firebase.ts`**: Firebase initialization and client setup.

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, React 18, Framer Motion, Recharts
- **Styling:** Vanilla CSS
- **Backend & Database:** Firebase (Firestore, Auth, Hosting)
- **AI Integration:** Google Gemini REST API

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
   
   # Gemini API Keys (Comma-separated)
   NEXT_PUBLIC_GEMINI_API_KEYS=key1,key2,key3
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment (Firebase Hosting)

The project is configured for static export (`output: 'export'` in `next.config.js`).

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to Firebase Hosting
npx firebase deploy --only hosting
```
# EcoPulse
"# EcoPulse" 

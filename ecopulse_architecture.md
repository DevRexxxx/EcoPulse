# EcoPulse — System Architecture

> A mobile-first, AI-driven carbon tracking and behavior-change platform.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Frontend Layer](#3-frontend-layer)
4. [Backend Layer](#4-backend-layer)
5. [Data Layer](#5-data-layer)
6. [AI & Action Engine](#6-ai--action-engine)
7. [External API Integrations](#7-external-api-integrations)
8. [Gamification Subsystem](#8-gamification-subsystem)
9. [Security & Privacy](#9-security--privacy)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Critical Risks & Mitigations](#11-critical-risks--mitigations)
12. [MVP vs. Full Product Scope](#12-mvp-vs-full-product-scope)

---

## 1. System Overview

EcoPulse is structured as a **three-tier web/mobile application** with an AI inference layer sitting between the backend and the client. The platform has four primary subsystems:

| Subsystem | Responsibility |
|---|---|
| **Tracking Engine** | Auto-detect mobility, parse transactions, build emissions timeline |
| **Action Engine (AI)** | Generate hyper-personalized micro-habit suggestions |
| **Gamification Layer** | Points, streaks, leaderboards, rewards marketplace |
| **Data Pipeline** | Store, aggregate, and serve time-series emissions data |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│          Next.js PWA  /  Flutter Mobile App                 │
│   ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐ │
│   │  Onboarding  │  │  Dashboard /  │  │  Rewards /      │ │
│   │  Swipe Quiz  │  │  Carbon Graph │  │  Leaderboard    │ │
│   └──────┬───────┘  └───────┬───────┘  └────────┬────────┘ │
└──────────┼──────────────────┼───────────────────┼──────────┘
           │         HTTPS / REST + WebSocket      │
┌──────────▼──────────────────▼───────────────────▼──────────┐
│                        API GATEWAY                          │
│             (Rate limiting, Auth, Routing)                  │
└──────────┬──────────────────┬───────────────────┬──────────┘
           │                  │                   │
┌──────────▼──────┐  ┌────────▼────────┐  ┌──────▼──────────┐
│  User Service   │  │ Tracking Service│  │  Action Engine  │
│  Auth / Profile │  │ Mobility + Txns │  │  AI Inference   │
└──────────┬──────┘  └────────┬────────┘  └──────┬──────────┘
           │                  │                   │
┌──────────▼──────────────────▼───────────────────▼──────────┐
│                        DATA LAYER                           │
│     PostgreSQL (Supabase)     │     Redis (Cache/Queues)    │
└─────────────────┬─────────────────────────────┬────────────┘
                  │                             │
     ┌────────────▼─────────────┐  ┌────────────▼───────────┐
     │    External APIs          │  │   Background Workers   │
     │  Climatiq / Carbon Iface  │  │  Emissions Aggregation │
     │  Google Maps API          │  │  Push Notifications    │
     │  Plaid API (Stretch)      │  │  Streak Processing     │
     └──────────────────────────┘  └────────────────────────┘
```

---

## 3. Frontend Layer

### Technology Choice
**Next.js (PWA)** for hackathon speed; Flutter as a stretch target for native mobile.

### Key Screens & Components

| Screen | Component | Notes |
|---|---|---|
| Onboarding | `SwipeQuiz` | Tinder-style card swiper, stores baseline to context |
| Dashboard | `CarbonGraph` | Recharts time-series, daily/weekly/monthly toggle |
| Action Feed | `ActionCard` | Push notification replica, dismissible, with CO2 delta |
| Leaderboard | `NeighborhoodBoard` | Anonymized radius-based ranking |
| Rewards | `EcoMarketplace` | Point balance + partner offer cards |

### State Management
- **Zustand** for lightweight global state (user profile, point balance, active streaks)
- **React Query** for server-state caching and background refetching of emissions data

---

## 4. Backend Layer

### Technology Choice
**Python (FastAPI)** — recommended due to native ML library support for the Action Engine.

### Service Breakdown

#### 4.1 User Service
```
POST   /auth/register         # Email or OAuth (Google)
POST   /auth/login
GET    /users/me
PUT    /users/me/baseline      # Store onboarding quiz results
```

#### 4.2 Tracking Service
```
POST   /tracking/trip          # Receive a detected trip (mode, distance, coordinates)
GET    /tracking/history       # Paginated emissions timeline
POST   /tracking/transaction   # Plaid webhook receiver (stretch goal)
```

Internally, every recorded trip or transaction is run through the **Emissions Calculator** module before persistence:

```python
# Pseudocode: Emissions Calculator
def calculate_emissions(mode: str, distance_km: float) -> float:
    factor = climatiq_api.get_factor(activity=mode, region=user.region)
    return distance_km * factor.co2e_kg
```

#### 4.3 Action Engine Service
```
GET    /actions/suggestions    # Returns top-3 personalized suggestions
POST   /actions/complete       # Mark action done, trigger point award
```

#### 4.4 Gamification Service
```
GET    /leaderboard/nearby     # Radius-based neighbor ranking
GET    /rewards/offers         # Active marketplace offers
POST   /rewards/redeem         # Spend EcoPoints on a reward
GET    /users/me/stats         # Streak count, total CO2 saved, badge list
```

---

## 5. Data Layer

### Primary Database: PostgreSQL (via Supabase)

**Core Tables:**

```sql
-- Users & baseline
users (id, email, region, created_at)
baselines (user_id, diet_type, transit_pref, home_type, updated_at)

-- Emissions tracking
trips       (id, user_id, mode, distance_km, co2e_kg, recorded_at)
transactions(id, user_id, category, merchant, amount, co2e_kg, recorded_at)

-- Gamification
points_ledger (id, user_id, delta, reason, created_at)
streaks       (user_id, current_streak, longest_streak, last_activity_date)
badges        (id, name, criteria_json)
user_badges   (user_id, badge_id, earned_at)

-- Marketplace
rewards       (id, partner_name, points_cost, description, expires_at)
redemptions   (id, user_id, reward_id, redeemed_at)
```

### Cache Layer: Redis
- Session tokens and rate-limit counters
- Leaderboard sorted sets (`ZADD leaderboard:neighborhood:<geo_hash> score user_id`)
- Action suggestion cache (TTL: 6 hours per user to avoid redundant AI calls)

---

## 6. AI & Action Engine

This is the core differentiator of EcoPulse.

### Input Context (per user)
```json
{
  "baseline": { "diet": "meat_heavy", "commute": "car", "home": "apartment" },
  "recent_trips": [ { "mode": "car", "distance_km": 12, "co2e_kg": 2.1 } ],
  "top_emission_category": "mobility",
  "streak": 3,
  "region": "IN-UP"
}
```

### Prompt Design
The Action Engine calls an LLM (e.g., Claude via Anthropic API) with structured context and asks for 3 specific, measurable suggestions formatted as JSON:

```
System: You are a climate behavior coach. Generate exactly 3 concise, 
        actionable micro-habits. Each must include an estimated CO2 saving 
        and a points reward. Output only valid JSON.

User:   [Serialized user context above]
```

### Output Schema
```json
[
  {
    "suggestion": "Take the metro to work tomorrow instead of driving",
    "co2_saved_kg": 4.2,
    "eco_points": 50,
    "category": "mobility",
    "difficulty": "easy"
  }
]
```

### Fallback Strategy
- If the AI call fails or exceeds latency budget (>2s), fall back to **rule-based suggestions** keyed on `top_emission_category`.
- Cache successful responses per user (Redis TTL: 6h) to reduce API costs.

---

## 7. External API Integrations

| API | Purpose | Key Concern |
|---|---|---|
| **Climatiq API** | Scientifically verified CO2 emission factors by activity + region | Rate limits on free tier; cache factor lookups aggressively |
| **Google Maps Platform** | Distance matrix, route detection, transit mode inference | Cost at scale; use only on trip-end events, not continuous polling |
| **Plaid API** *(Stretch)* | Bank transaction categorization for consumption emissions | Requires user consent flow; significant compliance overhead |
| **Anthropic API** | LLM inference for Action Engine suggestions | Prompt token cost; mitigated by caching and concise context |
| **Firebase Cloud Messaging** | Push notifications for action suggestions | Free tier sufficient for hackathon scale |

---

## 8. Gamification Subsystem

### Points Economy

| Action | EcoPoints Awarded |
|---|---|
| Complete daily swipe quiz | +10 |
| Log a green commute trip | +25–75 (scaled by CO2 saved) |
| Complete an AI suggestion | +50 |
| 7-day streak milestone | +200 bonus |
| Refer a friend | +100 |

### Leaderboard Design
- Geo-hashed into ~5km radius neighborhoods using **Geohash Level 5**
- Stored as Redis sorted sets for O(log N) ranking
- Refreshed every 15 minutes via background worker
- Anonymized display names to encourage participation without over-competition

### Badge System
Badges are defined by a `criteria_json` rule evaluated server-side on action completion:

```json
{ "type": "streak", "threshold": 7 }         // "Green Week" badge
{ "type": "total_co2_saved_kg", "threshold": 100 }  // "100kg Club" badge
{ "type": "category_actions", "category": "mobility", "count": 10 }
```

---

## 9. Security & Privacy

| Concern | Mitigation |
|---|---|
| Location data sensitivity | Store only trip distance + mode, never raw GPS paths |
| Financial data (Plaid) | Never store raw transaction data; store only category + CO2 estimate |
| Auth | JWT (short-lived, 15min) + refresh tokens; OAuth via Google |
| API key exposure | All third-party keys server-side only; no client-accessible secrets |
| GDPR / Data deletion | `DELETE /users/me` cascade-deletes all personal data within 24h |

---

## 10. Deployment Strategy

### Hackathon (Day 1–2)
```
Vercel (Next.js frontend)
  └── Supabase (PostgreSQL + Auth)
  └── FastAPI on Railway or Render (free tier)
        └── Redis on Upstash (serverless, free tier)
```

### Post-Hackathon / Production Path
```
AWS / GCP
  ├── ECS (containerized FastAPI microservices)
  ├── RDS PostgreSQL (Multi-AZ)
  ├── ElastiCache Redis
  ├── CloudFront CDN (Next.js static assets)
  └── SQS (background job queue for emissions aggregation)
```

---

## 11. Critical Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Google Maps API cost overrun | High | Cache routes; only call API on trip completion, not during travel |
| Plaid integration complexity | High | Treat as stretch goal; build mock transaction data for demo |
| AI suggestion latency | Medium | 6-hour Redis cache per user; synchronous fallback to rule engine |
| Location permission denial | Medium | Gracefully degrade to manual trip logging with a simple form |
| Climatiq factor gaps for India | Medium | Pre-seed a local factor table from IPCC/MoEFCC public datasets |
| Leaderboard gaming | Low | Rate-limit point-earning events; anomaly detection on point velocity |

---

## 12. MVP vs. Full Product Scope

| Feature | MVP (Hackathon) | Full Product |
|---|---|---|
| Onboarding quiz | ✅ Swipe-style, 5 questions | Adaptive, 15+ questions with ML baseline inference |
| Mobility tracking | ✅ Manual trip log + Maps API | Background auto-detection with CoreMotion / ActivityRecognition |
| Consumption tracking | ❌ Mock data only | ✅ Full Plaid integration with consent flow |
| Action Engine | ✅ LLM via API (cached) | Fine-tuned model on user behavior cohorts |
| Leaderboard | ✅ Global mock leaderboard | ✅ Real geo-hashed neighborhood boards |
| Rewards marketplace | ✅ Static partner cards | ✅ Live inventory + partner CMS |
| Carbon offsets | ❌ | ✅ Stripe round-up + certified offset registry |

---

*Architecture version 1.0 — EcoPulse Hackathon Submission*

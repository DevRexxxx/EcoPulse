# ADR 002: Database & Authentication Strategy

**Status:** Accepted
**Date:** 2026-06-12

## Context
We need a secure, scalable database and authentication provider that integrates easily with Next.js.

## Decision
We chose **Firebase** (Firestore and Firebase Auth).

## Consequences
- **Pros**: Rapid setup, real-time database capabilities, built-in secure auth, no need to maintain a separate backend server for basic CRUD.
- **Cons**: Vendor lock-in, complex querying constraints compared to a traditional SQL database.

---

# ADR 003: Recommendation Engine Design

**Status:** Accepted
**Date:** 2026-06-12

## Context
Providing hyper-personalized carbon reduction suggestions is a core platform feature.

## Decision
We utilize an **LLM (Anthropic API / OpenAI)** for generating suggestions based on user context (recent activities, baselines). Fallbacks to a static rule-based system are implemented for reliability.

## Consequences
- **Pros**: Highly engaging and context-aware suggestions.
- **Cons**: API costs, latency, potential for hallucinations (mitigated by strict schema and validation).

---

# ADR 004: Deployment & Caching Strategy

**Status:** Accepted
**Date:** 2026-06-12

## Context
The application needs to be performant and globally accessible.

## Decision
We deploy the Next.js application on **Vercel**, utilizing their Edge Network for API routes where applicable, and React Query for client-side caching of Firebase data.

## Consequences
- **Pros**: Zero-config deployment, excellent global performance, optimized asset delivery.
- **Cons**: Tied to Vercel's ecosystem for edge functions.

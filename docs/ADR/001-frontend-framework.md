# ADR 001: Frontend Framework Choice

**Status:** Accepted
**Date:** 2026-06-12

## Context
EcoPulse requires a fast, mobile-first web application that can quickly render dynamic data (emissions, graphs, leaderboards) and provide a smooth user experience.

## Decision
We chose **Next.js (App Router)** with **TypeScript**, **React**, and **Zustand**.

## Consequences
- **Pros**: Rapid development, excellent performance through Server-Side Rendering (SSR) and Edge API routes, seamless TypeScript integration.
- **Cons**: Monolithic structure might require refactoring if mobile apps (React Native/Flutter) are introduced later.

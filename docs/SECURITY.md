# Security Strategy

## Overview
This document outlines the security controls and testing strategy for the EcoPulse platform. Because the application is a Next.js App Router project utilizing Firebase, our primary focus is on protecting API Routes, securing Firestore access, and mitigating client-side vulnerabilities.

## Implemented Security Controls

### 1. Authentication & Authorization
- **Firebase Auth**: Used for all user authentication (email/password, OAuth).
- **JWT Validation**: Firebase tokens are validated on all Next.js API Routes using `firebase-admin`.
- **Firestore Security Rules**: Rules are configured to ensure users can only read/write their own records (`request.auth.uid == resource.data.userId`).

### 2. Client-Side Security
- **XSS Prevention**: React's built-in JSX escaping prevents stored and reflected XSS. We enforce `eslint-plugin-security` to catch dangerous DOM manipulations (e.g., `dangerouslySetInnerHTML`).
- **CSRF Protection**: Firebase Auth handles state securely. Next.js API routes validate the Authorization header, preventing cross-site request forgery.

### 3. API Security
- **Rate Limiting**: Rate limiting logic should be implemented on the API routes (e.g., using Upstash Redis or Vercel Edge functions) to prevent brute-force attacks on AI verification endpoints.
- **Input Validation**: All incoming API requests are validated (e.g., using Zod) before processing to prevent NoSQL injection.

## Automated Security Testing
- **Dependency Scanning**: `npm audit` is integrated into the CI/CD pipeline to catch vulnerable dependencies.
- **Static Analysis**: ESLint is configured with `eslint-plugin-security` to flag potential vulnerabilities in the codebase.
- **Secret Detection**: GitHub Advanced Security (or custom grep scripts) will scan for leaked API keys (e.g., Anthropic, Google Maps) in the CI pipeline.

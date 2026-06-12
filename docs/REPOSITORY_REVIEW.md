# Repository Review

## 1. Current Architecture
EcoPulse is currently built as a **monolithic Next.js application** using the App Router (`src/app/`), instead of the Python FastAPI backend described in the initial architectural overview. 
Key technologies include:
- **Frontend**: Next.js 14, React 18, Zustand (State Management), React Query, Recharts.
- **Backend**: Next.js API Routes (`src/app/api/`).
- **Database/Auth**: Firebase & Firestore.
- **Testing**: Vitest, React Testing Library.

## 2. Technical Debt & Missing Capabilities
- **Incomplete Test Coverage**: `src/store/userStore.test.ts` exists, but there is no comprehensive unit testing for components, API routes, or Firebase interactions.
- **Missing E2E Tests**: No automated browser tests exist to validate critical user journeys (Registration -> Tracking -> Rewards).
- **Missing Security Checks**: The codebase currently lacks automated security scanning, CSRF protection validation, or XSS payload testing in the CI/CD pipeline.
- **Missing Accessibility Tests**: No Axe-core or Lighthouse validations are implemented in the build process.
- **Missing AI Validation**: The `verify-action` API route relies on LLMs, but lacks automated tests to ensure schema compliance, absence of hallucinations, and consistent carbon values.

## 3. Risk Assessment
- **High Risk**: Broken critical user paths (e.g., carbon logging) might go unnoticed without E2E tests.
- **Medium Risk**: Firebase security rules might not align perfectly with application logic due to lack of integration tests between frontend and Firestore.
- **Medium Risk**: AI-generated responses could hallucinate inaccurate carbon metrics, harming user trust.

## 4. Recommended Improvements
- **Unit & Integration**: Implement comprehensive Vitest suites mocking Firebase and the Next.js router.
- **E2E**: Integrate Playwright to automate Journeys 1-7 using mocked API/Firebase responses.
- **Security**: Add `eslint-plugin-security` and GitHub Actions payload scans.
- **Accessibility**: Integrate `@axe-core/playwright` to enforce WCAG 2.1 AA compliance.
- **AI Governance**: Implement specific tests for the Next.js API routes that mock Anthropic/OpenAI to validate fallback behavior and response parsing.
- **CI/CD**: Enforce quality gates using a GitHub Actions workflow.

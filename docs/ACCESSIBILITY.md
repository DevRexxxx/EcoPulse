# Accessibility Strategy

## Goal
Achieve and maintain **WCAG 2.1 AA** compliance across the EcoPulse Carbon Footprint Awareness Platform.

## Core Accessibility Features
1. **Keyboard Navigation**: All interactive elements (buttons, forms, links) are reachable and operable via the Tab key. Focus states are clearly visible.
2. **Screen Reader Compatibility**: ARIA labels and semantic HTML (`<nav>`, `<main>`, `<article>`) are used. Images have descriptive `alt` tags.
3. **Color Contrast**: All text and interactive elements meet the minimum contrast ratio of 4.5:1 (normal text) and 3:1 (large text).
4. **Responsive Layouts**: The application is usable at 200% zoom and scales gracefully on mobile devices.

## Automated Testing Strategy
We use **Axe-core** integrated with **Playwright** to automatically scan for accessibility violations during the CI/CD process.

### Test Coverage
- `axe.spec.ts` will navigate through all major routes (Dashboard, Onboarding, Leaderboard) and assert that zero accessibility violations exist.
- Component-level accessibility is enforced via `eslint-plugin-jsx-a11y` during local development.

## Manual Testing Protocol
Developers are expected to manually verify:
1. Focus management during modal dialogs (e.g., AI Verification Modal).
2. Screen reader announcements for dynamic content updates (e.g., when a new recommendation is loaded).

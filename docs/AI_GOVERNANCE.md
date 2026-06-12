# AI Governance Strategy

## Overview
EcoPulse uses Large Language Models (LLMs) to generate personalized carbon-reduction recommendations and verify user activities. This document defines the governance rules to ensure the AI remains safe, accurate, and aligned with our climate goals.

## Core Principles

1. **Hallucination Prevention**: The LLM must NEVER invent emission values. All carbon emission factors must originate from verified sources (e.g., Climatiq API) or local constant tables.
2. **Recommendation Validation**: AI outputs must conform to a strict JSON schema. If the output fails parsing, the system must gracefully fall back to rule-based recommendations.
3. **Safety Rules**: The AI must not suggest dangerous, illegal, or physically harmful activities. 

## Implementation

### 1. Confidence Scoring & Fallbacks
- The system includes a fallback mechanism if the AI fails to respond within the latency budget (< 2s) or returns invalid JSON.
- Rule-based suggestions (e.g., "Walk instead of drive for trips under 2km") are used as the primary fallback.

### 2. Carbon Calculation Verification
- The AI is used for *suggestion generation* and *activity verification* (e.g., analyzing an uploaded image), NOT for mathematical calculations.
- Math and factor multiplication are handled strictly by deterministic TypeScript logic.

## Automated AI Validation Tests
We implement tests in our CI pipeline that use a mocked LLM response to ensure:
- The system correctly parses valid JSON.
- The system rejects invalid schemas and triggers the fallback.
- The system ignores any hallucinated CO2 values from the LLM and overrides them with deterministic calculations.

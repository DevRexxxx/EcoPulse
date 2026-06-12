# KPI Tracking

## Business & Engagement Metrics
EcoPulse tracks the following Key Performance Indicators (KPIs) to evaluate platform success:

1. **Weekly Active Users (WAU)**: Users who log at least one activity per week.
2. **Monthly Active Users (MAU)**: Users who interact with the platform at least once a month.
3. **Recommendation Adoption Rate**: The percentage of AI-generated suggestions that users mark as "Completed".
4. **Carbon Reduction Per User**: Total estimated $CO_2$ saved per user over time.
5. **Streak Retention**: Average length of consecutive daily activity logging.
6. **Challenge Participation**: Percentage of users enrolled in community or neighborhood leaderboards.

## Technical Implementation
- These KPIs are derived directly from Firestore data (e.g., counting `trips`, summing `co2e_kg` savings, and tracking `user_badges`).
- Future iterations will include a dedicated analytics dashboard to visualize these trends over time.

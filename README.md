# supportme-api

The SupportME API is the middleware layer for the SupportME customer support app built for the Wix App Marketplace.

## Purpose
- Provides a secure proxy between Wix (frontend dashboards) and Supabase (database, auth, storage).
- Protects schema and business logic from exposure in the browser.
- Enforces plan limits and subscription features (Starter, Pro, Premier, Ultimate).
- Integrates with RingzU Telecom API for VoIP and SMS features (Ultimate + Pro tiers).

## Tech Stack
- Node.js + Express
- Supabase (Postgres, Auth, Storage)
- Render (deployment & hosting)
- CORS enabled for integration with Wix apps

## Endpoints
### Health Check


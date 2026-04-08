# Waypoint

AI-powered travel itinerary generator. Enter a destination and travel dates, and Waypoint produces a detailed day-by-day plan using Claude (Anthropic).

## What it does

- Generates personalized travel itineraries from a destination, date range, and travel preferences
- Saves trips to a dashboard so you can revisit and manage them
- Lets you export any itinerary as a PDF
- Enforces a monthly generation quota for free users (3/month), with Stripe-powered paywall for additional generations
- Auth via Clerk, database via Postgres + Drizzle ORM

## Stack

- **Framework**: Next.js (App Router)
- **AI**: Anthropic Claude via `@anthropic-ai/sdk`
- **Auth**: Clerk
- **Database**: Postgres + Drizzle ORM (hosted on Vercel Postgres)
- **Payments**: Stripe
- **Styling**: Tailwind CSS v4

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in your keys for Clerk, Anthropic, Stripe, and Postgres.

## Database

```bash
# Push schema changes
npx drizzle-kit push
```

# LeadHandler.ai

Lead routing and inbox for real estate brokerages. Turn new leads into appointments faster.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm` if pnpm is not installed.

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in values as needed:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g. http://localhost:3000) | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | For billing |
| `AIRTABLE_API_KEY` | Airtable API key | For leads/agents sync |
| `AIRTABLE_BASE_ID` | Airtable base ID | For leads/agents sync |
| `STRIPE_SECRET_KEY` | Stripe secret key | For checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For webhooks |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | For SMS |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | For SMS |
| `TWILIO_FROM_NUMBER` | Twilio phone number | For SMS |
| `MAKE_WEBHOOK_URL` | Make.com webhook URL | For automations |
| `DEMO_MODE_DEFAULT` | Default demo mode (true/false) | No, defaults true |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | For production (keyless in dev) |
| `CLERK_SECRET_KEY` | Clerk secret key | For production (keyless in dev) |

## Demo mode

When demo mode is **on** (default), the app uses in-memory seed data. No API keys are required. Toggle demo mode in the top bar (Owner only). When demo mode is **off** and env vars are missing, pages show empty states with a "Connect in Settings" prompt.

- **On**: Fast, no network. Realistic leads, agents, messages.
- **Off**: Uses API routes. If Airtable/Twilio/Stripe are not configured, you get empty states.

## Connecting real integrations

### Airtable

1. Create an Airtable base with tables for Leads and Agents.
2. Create an API token at [airtable.com/account](https://airtable.com/account).
3. Add `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` to `.env.local`.
4. Implement the sync logic in `src/lib/airtable.ts` (currently stubbed).

### Twilio

1. Sign up at [twilio.com](https://twilio.com).
2. Get a phone number for SMS.
3. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` to `.env.local`.
4. Configure webhook URL for inbound SMS: `POST /api/webhooks/twilio`.

### Stripe

1. Create products and prices in [Stripe Dashboard](https://dashboard.stripe.com).
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Implement checkout/portal in `src/lib/stripe.ts`.
4. Configure webhook: `POST /api/webhooks/stripe` with `STRIPE_WEBHOOK_SECRET`.

### Make

1. Create a webhook scenario in [Make](https://make.com).
2. Add `MAKE_WEBHOOK_URL` to `.env.local`.
3. The `/api/make/trigger` route forwards payloads to that URL.
4. Configure the scenario to write Lead **Source** and **Status** (and optionally closure/appointment) to Airtable so the dashboard and leads list stay accurate.

## Auth (Clerk)

The app uses [Clerk](https://clerk.com) for sign-in and sign-up. Roles (Broker-Owner, Agent) are stored in Clerk user `publicMetadata` and synced from the optional Airtable Users table. For local development you can use Clerk keyless mode (`next dev` without keys). For `next build` and production, set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env.local`.

### Testing roles

To test different roles: open [Clerk Dashboard](https://dashboard.clerk.com) → Users → select a user → **Public metadata** → set `role` to `owner`, `broker`, or `agent`. For `agent`, also set `agentId` to an Airtable Agents record ID so "My recent leads" shows assigned leads. Owners can use **View as** on the Account page (`/app/account`) to preview broker/agent views.

## Build and deploy

```bash
pnpm build
pnpm start
```

### Vercel

1. Connect the repo to Vercel.
2. Add environment variables in the Vercel project settings.
3. Deploy. The `SESSION_SECRET` must be set; use a strong random value in production.

## Project structure

```
src/
  app/
    (marketing)/     # Public pages: /, /pricing, /security, /contact
    login/           # Role picker, sets session
    app/             # Protected app: /app/dashboard, /app/leads, etc.
    api/             # Route handlers
  components/
    ui/              # shadcn components
    app/             # App-specific: Sidebar, Topbar, DataTable, etc.
  lib/
    env.mjs          # Safe env parsing
    config.ts        # Integration flags (hasAirtable, etc.)
    types.ts         # Shared types
    demo/            # Seed data and helpers
    auth.ts          # Session helpers
```

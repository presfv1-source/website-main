import { z } from "zod";

const serverSchema = z.object({
  /** Clerk secret — required in production at runtime; optional here so build never throws */
  CLERK_SECRET_KEY: z.string().default(""),
  AIRTABLE_API_KEY: z.string().default(""),
  AIRTABLE_BASE_ID: z.string().default(""),
  AIRTABLE_TABLE_LEADS: z.string().default("Leads"),
  AIRTABLE_TABLE_AGENTS: z.string().default("Agents"),
  AIRTABLE_TABLE_MESSAGES: z.string().default("Messages"),
  /** Optional: Users table with Email, Role (broker/agent), Agent (link to Agents) */
  AIRTABLE_TABLE_USERS: z.string().default(""),
  /** Waitlist table for beta signups (Email, Name, Source) */
  AIRTABLE_TABLE_WAITLIST: z.string().default("Waitlist"),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_PRICE_ID_ESSENTIALS: z.string().default(""),
  STRIPE_PRICE_ID_PRO: z.string().default(""),
  TWILIO_ACCOUNT_SID: z.string().default(""),
  TWILIO_AUTH_TOKEN: z.string().default(""),
  TWILIO_FROM_NUMBER: z.string().default(""),
  MAKE_WEBHOOK_URL: z.string().default(""),
  /** OpenAI API key for AI qualification. Takes priority over Anthropic. */
  OPENAI_API_KEY: z.string().default(""),
  /** Anthropic API key for AI qualification. Used if OPENAI_API_KEY is empty. */
  ANTHROPIC_API_KEY: z.string().default(""),
  /** LLM model override. Defaults to gpt-4o-mini (OpenAI) or claude-sonnet-4-20250514 (Anthropic). */
  LLM_MODEL: z.string().default(""),
  /** Optional secret for POST /api/llm/reply. If set, require X-API-Key or Authorization: Bearer. */
  LLM_API_KEY: z.string().default(""),
  DEMO_MODE_DEFAULT: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SESSION_SECRET: z.string().min(16).default("super-secret-for-demo-only-change-in-prod"),
  /** Broker email allowed for dev/direct login (no real auth yet) */
  DEV_ADMIN_EMAIL: z.string().default(""),
  /** Set to "true" when Twilio A2P 10DLC campaign is approved. Default false. */
  A2P_READY: z.string().default("false"),
  /** NextAuth (v5): secret for JWT/session; set in production */
  NEXTAUTH_SECRET: z.string().default(""),
  /** NextAuth: app URL (e.g. http://localhost:3000) */
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  /** Google OAuth */
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  /** Apple Sign-In (Service ID; client secret via APPLE_SECRET) */
  APPLE_ID: z.string().default(""),
  APPLE_SECRET: z.string().default(""),
  /** Session JWT signing (required for Firebase session cookie) */
  AUTH_SECRET: z.string().default(""),
  /** Firebase Admin SDK (server-only) */
  FIREBASE_ADMIN_PROJECT_ID: z.string().default(""),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().default(""),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().default(""),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().default("http://localhost:3000")
  ),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default(""),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(""),
  /** Pre-fill login email in dev (e.g. presfv1@gmail.com) */
  NEXT_PUBLIC_DEV_LOGIN_EMAIL: z.string().default(""),
  /** Firebase (client config; safe to expose, restrict in Firebase Console) */
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().default(""),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().default(""),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default(""),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().default(""),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().default(""),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().default(""),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().default(""),
});

function parseEnv() {
  const server = serverSchema.safeParse({
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_LEADS: process.env.AIRTABLE_TABLE_LEADS,
    AIRTABLE_TABLE_AGENTS: process.env.AIRTABLE_TABLE_AGENTS,
    AIRTABLE_TABLE_MESSAGES: process.env.AIRTABLE_TABLE_MESSAGES,
    AIRTABLE_TABLE_USERS: process.env.AIRTABLE_TABLE_USERS ?? "",
    AIRTABLE_TABLE_WAITLIST: process.env.AIRTABLE_TABLE_WAITLIST ?? "Waitlist",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID_ESSENTIALS: process.env.STRIPE_PRICE_ID_ESSENTIALS,
    STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    LLM_MODEL: process.env.LLM_MODEL,
    LLM_API_KEY: process.env.LLM_API_KEY ?? "",
    DEMO_MODE_DEFAULT: process.env.DEMO_MODE_DEFAULT ?? "false",
    SESSION_SECRET: process.env.SESSION_SECRET,
    DEV_ADMIN_EMAIL: process.env.DEV_ADMIN_EMAIL,
    A2P_READY: process.env.A2P_READY ?? "false",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    APPLE_ID: process.env.APPLE_ID,
    APPLE_SECRET: process.env.APPLE_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  });

  const client = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_DEV_LOGIN_EMAIL: process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });

  if (!server.success) {
    throw new Error(`Server env validation failed: ${server.error.message}`);
  }
  if (!client.success) {
    throw new Error(`Client env validation failed: ${client.error.message}`);
  }

  return { server: server.data, client: client.data };
}

export const env = parseEnv();

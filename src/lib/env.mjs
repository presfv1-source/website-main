import { z } from "zod";

const serverSchema = z.object({
  AIRTABLE_API_KEY: z.string().default(""),
  AIRTABLE_BASE_ID: z.string().default(""),
  AIRTABLE_TABLE_LEADS: z.string().default("Leads"),
  AIRTABLE_TABLE_AGENTS: z.string().default("Agents"),
  AIRTABLE_TABLE_MESSAGES: z.string().default("Messages"),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  TWILIO_ACCOUNT_SID: z.string().default(""),
  TWILIO_AUTH_TOKEN: z.string().default(""),
  TWILIO_FROM_NUMBER: z.string().default(""),
  MAKE_WEBHOOK_URL: z.string().default(""),
  DEMO_MODE_DEFAULT: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  SESSION_SECRET: z.string().min(16).default("super-secret-for-demo-only-change-in-prod"),
  /** Broker email allowed for dev/direct login (no real auth yet) */
  DEV_ADMIN_EMAIL: z.string().default(""),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().url().default("http://localhost:3000")
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(""),
  /** Pre-fill login email in dev (e.g. presfv1@gmail.com) */
  NEXT_PUBLIC_DEV_LOGIN_EMAIL: z.string().default(""),
});

function parseEnv() {
  const server = serverSchema.safeParse({
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_LEADS: process.env.AIRTABLE_TABLE_LEADS,
    AIRTABLE_TABLE_AGENTS: process.env.AIRTABLE_TABLE_AGENTS,
    AIRTABLE_TABLE_MESSAGES: process.env.AIRTABLE_TABLE_MESSAGES,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
    DEMO_MODE_DEFAULT: process.env.DEMO_MODE_DEFAULT ?? "true",
    SESSION_SECRET: process.env.SESSION_SECRET,
    DEV_ADMIN_EMAIL: process.env.DEV_ADMIN_EMAIL,
  });

  const client = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_DEV_LOGIN_EMAIL: process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL,
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

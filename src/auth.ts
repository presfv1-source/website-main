import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { compareSync } from "bcryptjs";
import { env } from "@/lib/env.mjs";
import {
  getAirtableUserByEmailForAuth,
  getAirtableUserByEmail,
  getAgentIdByEmail,
  createAirtableUser,
} from "@/lib/airtable";
import type { Role } from "@/lib/types";

function getDevAdminEmail(): string {
  const fromEnv = env.server.DEV_ADMIN_EMAIL?.trim();
  return fromEnv || "presfv1@gmail.com";
}

const secret = env.server.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
if (process.env.NODE_ENV === "production" && !secret) {
  throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required in production");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(env.server.GOOGLE_CLIENT_ID && env.server.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.server.GOOGLE_CLIENT_ID,
            clientSecret: env.server.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(env.server.APPLE_ID && env.server.APPLE_SECRET
      ? [
          Apple({
            clientId: env.server.APPLE_ID,
            clientSecret: env.server.APPLE_SECRET,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString()?.trim();
        const password = credentials?.password?.toString();
        if (!email) return null;

        const emailLower = email.toLowerCase();
        const devAdmin = getDevAdminEmail().toLowerCase();

        try {
          let airtableUser = await getAirtableUserByEmailForAuth(email);

          if (!airtableUser) {
            if (emailLower === devAdmin) {
              const created = await createAirtableUser(email, "owner");
              if (!created) return null;
              airtableUser = { role: "owner" as const, agentId: undefined, passwordHash: undefined };
            } else {
              const err = new CredentialsSignin("Account not found");
              err.code = "AccountNotFound";
              throw err;
            }
          }

          if (airtableUser.passwordHash) {
            if (!password || !compareSync(password, airtableUser.passwordHash)) return null;
          } else if (emailLower !== devAdmin) {
            return null;
          }

          let agentId = airtableUser.agentId;
          if (airtableUser.role === "agent" && !agentId) {
            const resolved = await getAgentIdByEmail(email);
            if (resolved) agentId = resolved;
          }
          const userId =
            airtableUser.role === "agent"
              ? `agent-${Buffer.from(email).toString("base64url").slice(0, 24)}`
              : `${airtableUser.role}-${Buffer.from(email).toString("base64url").slice(0, 24)}`;
          return {
            id: userId,
            email,
            name: email.split("@")[0],
            role: airtableUser.role,
            agentId: agentId ?? undefined,
          };
        } catch (e) {
          if (e instanceof CredentialsSignin) throw e;
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        const email = user.email?.trim();
        if (!email) return false;
        const emailLower = email.toLowerCase();
        const allowedBroker = getDevAdminEmail().toLowerCase();
        try {
          let airtableUser = await getAirtableUserByEmail(email);
          if (!airtableUser) {
            const role = emailLower === allowedBroker ? "owner" : "broker";
            airtableUser = await createAirtableUser(email, role);
            if (!airtableUser) {
              (user as { role?: Role }).role = role as Role;
              (user as { agentId?: string }).agentId = undefined;
              return true;
            }
          }
          (user as { role?: Role }).role = airtableUser.role;
          (user as { agentId?: string }).agentId = airtableUser.agentId;
          if (airtableUser.role === "agent" && !airtableUser.agentId) {
            const resolved = await getAgentIdByEmail(email);
            if (resolved) (user as { agentId?: string }).agentId = resolved;
          }
        } catch {
          const role = emailLower === allowedBroker ? "owner" : "broker";
          (user as { role?: Role }).role = role as Role;
          (user as { agentId?: string }).agentId = undefined;
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.userId = (user as { id?: string }).id ?? user.id;
        token.role = (user as { role?: Role }).role ?? "broker";
        token.name = user.name ?? undefined;
        token.agentId = (user as { agentId?: string }).agentId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { userId?: string }).userId = (token.userId as string) ?? token.sub;
        (session.user as { role?: Role }).role = (token.role as Role) ?? "broker";
        (session.user as { agentId?: string }).agentId = token.agentId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: secret || env.server.SESSION_SECRET,
  trustHost: true,
});

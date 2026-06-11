import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { ROLES } from "@eventrack/shared";

export function createAuth(options?: { baseURL?: string; secret?: string }) {
  const baseURL =
    options?.baseURL ??
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const secret =
    options?.secret ??
    process.env.BETTER_AUTH_SECRET ??
    "dev-secret-change-in-production";

  if (!process.env.DATABASE_URL) {
    return betterAuth({
      baseURL,
      secret,
      emailAndPassword: {
        enabled: false,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { prismaAdapter } = require("better-auth/adapters/prisma") as typeof import("better-auth/adapters/prisma");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { prisma } = require("@eventrack/database") as typeof import("@eventrack/database");

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    baseURL,
    secret,
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        creatorRole: ROLES.DIRECTION,
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

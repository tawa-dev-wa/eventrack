import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "@eventrack/database";
import { ROLES } from "@eventrack/shared";

export function createAuth(options?: { baseURL?: string; secret?: string }) {
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
    baseURL: options?.baseURL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret: options?.secret ?? process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production",
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        creatorRole: ROLES.DIRECTION,
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

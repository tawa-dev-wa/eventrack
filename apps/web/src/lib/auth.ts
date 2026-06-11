import { createAuth } from "@eventrack/auth";

export const auth = createAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

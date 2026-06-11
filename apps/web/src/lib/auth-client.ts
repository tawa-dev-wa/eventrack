"use client";

import { createEventrackAuthClient } from "@eventrack/auth/client";

export const authClient = createEventrackAuthClient(
  process.env.NEXT_PUBLIC_APP_URL
);

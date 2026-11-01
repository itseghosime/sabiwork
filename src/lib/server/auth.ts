import "server-only";

import { createNeonAuth } from "@neon/auth/next/server";
import { getServerEnv } from "./env";

let authInstance: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  authInstance ??= createNeonAuth({
    baseUrl: getServerEnv().authBaseUrl,
    cookies: { secret: getServerEnv().authCookieSecret },
  });
  return authInstance;
}

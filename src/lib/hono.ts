import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl) {
  throw new Error("NEXT_PUBLIC_APP_URL is not set in the environment");
}

export const client = hc<AppType>(appUrl);

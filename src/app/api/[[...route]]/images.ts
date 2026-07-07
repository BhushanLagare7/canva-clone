import { verifyAuth } from "@hono/auth-js";
import { Hono } from "hono";

import { unsplash } from "@/lib/unsplash";

const DEFAULT_COUNT = 30;
const DEFAULT_COLLECTION_IDS = ["317099"];

const app = new Hono().get("/", verifyAuth(), async (c) => {
  try {
    const { data, error } = await unsplash.GET("/photos/random", {
      params: {
        query: {
          collections: DEFAULT_COLLECTION_IDS,
          count: DEFAULT_COUNT,
        },
      },
    });

    if (error) {
      console.error("[images] Unsplash API error:", error);
      return c.json({ error: "Something went wrong" }, 400);
    }

    let response = data;

    if (!Array.isArray(response)) {
      response = [response];
    }

    return c.json({ data: response });
  } catch (e) {
    console.error("[images] Unsplash fetch exception:", e);
    return c.json({ error: "Something went wrong" }, 500);
  }
});

export default app;

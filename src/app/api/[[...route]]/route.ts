import { AuthConfig, initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import { handle } from "hono/vercel";

import authConfig from "@/auth.config";

import ai from "./ai";
import images from "./images";
import users from "./users";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

function getAuthConfig(): AuthConfig {
  return {
    secret: process.env.AUTH_SECRET,
    ...authConfig,
  };
}

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

const routes = app
  .route("/ai", ai)
  .route("/images", images)
  .route("/users", users);

export const GET = handle(routes);
export const POST = handle(routes);

export type AppType = typeof routes;

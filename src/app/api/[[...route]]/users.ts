import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

const app = new Hono().post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      email: z.email(),
      password: z.string().min(8).max(20),
    }),
  ),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
      })
      .onConflictDoNothing()
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Email already in use" }, 400);
    }

    return c.json(null, 200);
  },
);

export default app;


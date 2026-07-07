import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import { and, asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { projects, projectsInsertSchema } from "@/db/schema";

/**
 * Projects API routes.
 * All routes require authentication via `verifyAuth()`.
 */
const app = new Hono()
  /**
   * GET /templates
   * Fetch paginated list of template projects (public templates, not user-owned).
   * Sorted by non-pro first, then most recently updated.
   */
  .get(
    "/templates",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { page, limit } = c.req.valid("query");

      const data = await db
        .select()
        .from(projects)
        .where(eq(projects.isTemplate, true))
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(asc(projects.isPro), desc(projects.updatedAt));

      return c.json({ data });
    },
  )
  /**
   * DELETE /:id
   * Delete a project owned by the authenticated user.
   */
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, auth.token.id)))
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id } });
    },
  )
  /**
   * POST /:id/duplicate
   * Duplicate an existing project owned by the authenticated user.
   */
  .post(
    "/:id/duplicate",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, auth.token.id)));

      if (data.length === 0) {
        return c.json({ error: " Not found" }, 404);
      }

      const project = data[0];

      // Create a copy of the project with a modified name
      const duplicateData = await db
        .insert(projects)
        .values({
          name: `Copy of ${project.name}`,
          json: project.json,
          width: project.width,
          height: project.height,
          userId: auth.token.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return c.json({ data: duplicateData[0] });
    },
  )
  /**
   * GET /
   * Fetch paginated list of projects belonging to the authenticated user,
   * sorted by most recently updated. Supports cursor-style pagination via `nextPage`.
   */
  .get(
    "/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { page, limit } = c.req.valid("query");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, auth.token.id))
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(projects.updatedAt));

      return c.json({
        data,
        nextPage: data.length === limit ? page + 1 : null,
      });
    },
  )
  /**
   * PATCH /:id
   * Partially update a project owned by the authenticated user.
   */
  .patch(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    zValidator(
      "json",
      projectsInsertSchema
        .omit({
          id: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .partial(),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .update(projects)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.userId, auth.token.id)))
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data: data[0] });
    },
  )
  /**
   * GET /:id
   * Fetch a single project by ID, owned by the authenticated user.
   */
  .get(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, auth.token.id)));

      if (data.length === 0) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: data[0] });
    },
  )
  /**
   * POST /
   * Create a new project for the authenticated user.
   */
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      projectsInsertSchema.pick({
        name: true,
        json: true,
        width: true,
        height: true,
      }),
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { name, json, height, width } = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(projects)
        .values({
          name,
          json,
          width,
          height,
          userId: auth.token.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!data[0]) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data: data[0] });
    },
  );

export default app;

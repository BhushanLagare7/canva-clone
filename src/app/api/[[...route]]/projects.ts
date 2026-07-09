import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import { and, asc, desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { projects, projectsInsertSchema } from "@/db/schema";

// ============================================================================
// Constants & Schemas
// ============================================================================

const DEFAULT_PAGINATION = {
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
} as const;

const paginationSchema = z.object({
  page: z.coerce.number().int().min(DEFAULT_PAGINATION.MIN_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(DEFAULT_PAGINATION.MIN_LIMIT)
    .max(DEFAULT_PAGINATION.MAX_LIMIT),
});

const idParamSchema = z.object({ id: z.string() });

const projectCreateSchema = projectsInsertSchema.pick({
  name: true,
  json: true,
  width: true,
  height: true,
});

const projectUpdateSchema = projectsInsertSchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// ============================================================================
// Helpers
// ============================================================================

/**
 * Extracts and validates user ID from auth context.
 * @throws {HTTPException} 401 if user is not authenticated
 */
const requireUserId = (c: Context): string => {
  const userId = c.get("authUser")?.token?.id;

  if (!userId) {
    throw new HTTPException(401, {
      res: c.json({ error: "Unauthorized" }, 401),
    });
  }

  return userId as string;
};

/**
 * Calculates pagination offset from page and limit.
 */
const calculateOffset = (page: number, limit: number): number =>
  (page - 1) * limit;

/**
 * Creates timestamp fields for database operations.
 */
const createTimestamps = () => {
  const now = new Date();
  return { createdAt: now, updatedAt: now };
};

// ============================================================================
// Routes
// ============================================================================

const app = new Hono()
  /**
   * GET /templates
   * Fetch paginated list of template projects (public templates, not user-owned).
   * Sorted by non-pro first, then most recently updated.
   */
  .get(
    "/templates",
    verifyAuth(),
    zValidator("query", paginationSchema),
    async (c) => {
      const { page, limit } = c.req.valid("query");

      const data = await db
        .select()
        .from(projects)
        .where(eq(projects.isTemplate, true))
        .limit(limit)
        .offset(calculateOffset(page, limit))
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
    zValidator("param", idParamSchema),
    async (c) => {
      const userId = requireUserId(c);
      const { id } = c.req.valid("param");

      const [deleted] = await db
        .delete(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .returning({ id: projects.id });

      if (!deleted) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: { id: deleted.id } });
    },
  )

  /**
   * POST /:id/duplicate
   * Duplicate an existing project owned by the authenticated user.
   */
  .post(
    "/:id/duplicate",
    verifyAuth(),
    zValidator("param", idParamSchema),
    async (c) => {
      const userId = requireUserId(c);
      const { id } = c.req.valid("param");

      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, userId)));

      if (!project) {
        return c.json({ error: "Not found" }, 404);
      }

      const [duplicated] = await db
        .insert(projects)
        .values({
          name: `Copy of ${project.name}`,
          json: project.json,
          width: project.width,
          height: project.height,
          userId,
          ...createTimestamps(),
        })
        .returning();

      return c.json({ data: duplicated });
    },
  )

  /**
   * GET /
   * Fetch paginated list of projects belonging to the authenticated user,
   * sorted by most recently updated. Supports cursor-style pagination via `nextPage`.
   */
  .get("/", verifyAuth(), zValidator("query", paginationSchema), async (c) => {
    const userId = requireUserId(c);
    const { page, limit } = c.req.valid("query");

    const data = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .limit(limit)
      .offset(calculateOffset(page, limit))
      .orderBy(desc(projects.updatedAt));

    return c.json({
      data,
      nextPage: data.length === limit ? page + 1 : null,
    });
  })

  /**
   * PATCH /:id
   * Partially update a project owned by the authenticated user.
   */
  .patch(
    "/:id",
    verifyAuth(),
    zValidator("param", idParamSchema),
    zValidator("json", projectUpdateSchema),
    async (c) => {
      const userId = requireUserId(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      const [updated] = await db
        .update(projects)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.userId, userId)))
        .returning();

      if (!updated) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data: updated });
    },
  )

  /**
   * GET /:id
   * Fetch a single project by ID, owned by the authenticated user.
   */
  .get("/:id", verifyAuth(), zValidator("param", idParamSchema), async (c) => {
    const userId = requireUserId(c);
    const { id } = c.req.valid("param");

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));

    if (!project) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: project });
  })

  /**
   * POST /
   * Create a new project for the authenticated user.
   */
  .post(
    "/",
    verifyAuth(),
    zValidator("json", projectCreateSchema),
    async (c) => {
      const userId = requireUserId(c);
      const { name, json, height, width } = c.req.valid("json");

      const [created] = await db
        .insert(projects)
        .values({
          name,
          json,
          width,
          height,
          userId,
          ...createTimestamps(),
        })
        .returning();

      if (!created) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data: created });
    },
  );

export default app;

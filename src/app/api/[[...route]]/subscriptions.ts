/**
 * @fileoverview Subscription management API routes using Hono framework.
 * Handles Stripe billing, subscription checkout, and webhook events.
 *
 * @module subscriptions/api
 * @requires @hono/auth-js
 * @requires drizzle-orm
 * @requires hono
 * @requires stripe
 */

import { verifyAuth } from "@hono/auth-js";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import Stripe from "stripe";

import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { checkIsActive } from "@/features/subscriptions/lib";
import { getStripe } from "@/lib/stripe";

/**
 * Hono application instance containing all subscription-related routes.
 * All protected routes require valid authentication via verifyAuth() middleware.
 *
 * Base path: /subscriptions (configured in parent router)
 */
const app = new Hono()
  /**
   * POST /billing
   * @description Creates a Stripe billing portal session for managing existing subscriptions.
   *              Allows authenticated users to manage their payment methods, view invoices,
   *              and cancel subscriptions through Stripe's hosted portal.
   *
   * @middleware verifyAuth - Ensures request contains valid authentication token
   *
   * @returns {Object} 200 - { data: string } - Stripe billing portal URL
   * @returns {Object} 401 - { error: "Unauthorized" } - Missing or invalid auth token
   * @returns {Object} 404 - { error: "No subscription found" } - User has no active subscription
   * @returns {Object} 400 - { error: "Failed to create session" } - Stripe session creation failed
   *
   * @example
   * // Success Response
   * { data: "https://billing.stripe.com/session/..." }
   */
  .post("/billing", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    // Verify the authentication token contains a valid user ID
    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Fetch the user's subscription record from the database
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    // Return 404 if no subscription exists for this user
    if (!subscription) {
      return c.json({ error: "No subscription found" }, 404);
    }

    /**
     * Create a Stripe billing portal session.
     * The customer is redirected back to the app after managing their subscription.
     */
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    // Ensure the session URL was generated successfully
    if (!session.url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: session.url });
  })

  /**
   * GET /current
   * @description Retrieves the current subscription details for the authenticated user,
   *              including whether the subscription is currently active.
   *
   * @middleware verifyAuth - Ensures request contains valid authentication token
   *
   * @returns {Object} 200 - { data: Subscription & { active: boolean } } - Subscription details with active status
   * @returns {Object} 401 - { error: "Unauthorized" } - Missing or invalid auth token
   *
   * @example
   * // Success Response
   * {
   *   data: {
   *     id: "sub_123",
   *     userId: "user_123",
   *     status: "active",
   *     active: true,
   *     currentPeriodEnd: "2024-12-31T00:00:00.000Z",
   *     ...
   *   }
   * }
   */
  .get("/current", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    // Verify the authentication token contains a valid user ID
    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Fetch the user's current subscription record from the database
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    /**
     * Determine if the subscription is currently active.
     * checkIsActive validates subscription status and expiration date.
     * Returns false if subscription is undefined/null.
     */
    const active = checkIsActive(subscription);

    // Return subscription data merged with computed active status
    return c.json({
      data: {
        ...subscription,
        active,
      },
    });
  })

  /**
   * POST /checkout
   * @description Initiates a new Stripe checkout session for subscription purchase.
   *              Supports card and PayPal payment methods with automatic billing address collection.
   *
   * @middleware verifyAuth - Ensures request contains valid authentication token
   *
   * @returns {Object} 200 - { data: string } - Stripe checkout session URL
   * @returns {Object} 401 - { error: "Unauthorized" } - Missing or invalid auth token
   * @returns {Object} 400 - { error: "Failed to create session" } - Stripe session creation failed
   *
   * @example
   * // Success Response
   * { data: "https://checkout.stripe.com/pay/cs_..." }
   */
  .post("/checkout", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    // Verify the authentication token contains a valid user ID
    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    /**
     * Create a Stripe checkout session with subscription configuration.
     *
     * - success_url: Redirect destination after successful payment (with success flag)
     * - cancel_url: Redirect destination if user cancels checkout (with canceled flag)
     * - payment_method_types: Accepts both card and PayPal payments
     * - mode: "subscription" for recurring billing
     * - billing_address_collection: Automatically determines if address is needed
     * - metadata: Stores userId for linking subscription to user in webhook handler
     */
    const stripe = getStripe();
    if (!process.env.NEXT_PUBLIC_APP_URL || !process.env.STRIPE_PRICE_ID) {
      return c.json({ error: "Missing Stripe configuration" }, 500);
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=1`,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      ...(auth.token.email ? { customer_email: auth.token.email } : {}),
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Stripe Price ID from environment config
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.token.id, // Stored for webhook processing to link subscription to user
      },
    });

    const url = session.url;

    // Ensure the checkout URL was generated successfully
    if (!url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: url });
  })

  /**
   * POST /webhook
   * @description Handles incoming Stripe webhook events for subscription lifecycle management.
   *              Verifies webhook signature to ensure requests originate from Stripe.
   *
   * @description Handled Events:
   * - checkout.session.completed: Creates new subscription record in database when payment succeeds
   * - invoice.payment_succeeded: Updates existing subscription status and period end date on renewal
   *
   * @returns {Object} 200 - null - Webhook processed successfully
   * @returns {Object} 400 - { error: "Invalid signature" } - Webhook signature verification failed
   * @returns {Object} 400 - { error: "Invalid session" } - Missing userId in session metadata
   *
   * @security Uses STRIPE_WEBHOOK_SECRET to verify event authenticity
   *
   * @example
   * // Stripe sends POST request with event payload
   * // Headers: { "Stripe-Signature": "t=...,v1=..." }
   */
  .post("/webhook", async (c) => {
    // Extract raw request body and Stripe signature header for verification
    const body = await c.req.text();
    const signature = c.req.header("Stripe-Signature") as string;

    let event: Stripe.Event;

    /**
     * Verify the webhook signature to ensure the request is from Stripe.
     * Uses the raw body string (not parsed JSON) for signature validation.
     * Throws an error if signature is invalid or webhook secret is incorrect.
     */
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch {
      // Return 400 if signature verification fails (potential security threat)
      return c.json({ error: "Invalid signature" }, 400);
    }

    /**
     * Handle successful checkout completion.
     * Triggered when a user completes the payment process.
     * Creates a new subscription record in the database.
     */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Validate that userId was stored in session metadata during checkout creation
      if (!session?.metadata?.userId) {
        return c.json({ error: "Invalid session" }, 400);
      }

      /**
       * Insert new subscription record into database with:
       * - Subscription status from Stripe (e.g., "active", "trialing")
       * - User ID from session metadata for user-subscription linking
       * - Stripe IDs for future API operations (subscriptionId, customerId, priceId)
       * - Current period end converted from Unix timestamp to JavaScript Date
       */
      await db
        .insert(subscriptions)
        .values({
          status: subscription.status,
          userId: session.metadata.userId,
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceId: subscription.items.data[0].price.id,
          currentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000, // Convert Unix timestamp to ms
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscriptions.subscriptionId,
          set: {
            status: subscription.status,
            userId: session.metadata.userId,
            customerId: subscription.customer as string,
            priceId: subscription.items.data[0].price.id,
            currentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000,
            ),
            updatedAt: new Date(),
          },
        });
    }

    /**
     * Handle successful invoice payment.
     * Triggered when a subscription renewal payment succeeds.
     * Updates the existing subscription's status and billing period end date.
     */
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === "string"
        ? invoice.parent.subscription_details.subscription
        : invoice.parent?.subscription_details?.subscription?.id;

      if (!subscriptionId) {
        return c.json({ error: "No subscription ID found on invoice parent" }, 400);
      }

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionId,
      );

      /**
       * Update existing subscription record with latest billing information:
       * - Updated status in case it changed (e.g., "past_due" -> "active")
       * - New period end date for the next billing cycle
       * - Updated timestamp for audit trail
       */
      await db
        .update(subscriptions)
        .set({
          status: subscription.status,
          currentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000, // Convert Unix timestamp to ms
          ),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.subscriptionId, subscription.id));
    }

    // Return 200 to acknowledge successful webhook processing
    // Stripe will retry the webhook if it doesn't receive a 2xx response
    return c.json(null, 200);
  });

export default app;

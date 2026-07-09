This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Stripe Integration & Webhooks

The project features a Stripe recurring subscription payment flow integrated via a Hono API router on Next.js.

### Environment Variables
Configure the following Stripe variables in your `.env.local` file:
```env
STRIPE_SECRET_KEY=sk_test_...       # Stripe Secret Key
STRIPE_PRICE_ID=price_...          # Price ID for your recurring plan
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook signature verification secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Webhook Endpoints
- **Local Webhook URL:** `http://localhost:3000/api/subscriptions/webhook`
- **Production Webhook URL:** `https://<your-domain>/api/subscriptions/webhook`

### Local Development Setup & Testing
To forward Stripe webhook events to your local server during development, follow these steps:

1. **Install Stripe CLI** (if not already installed).
2. **Start the local forwarder** targeting the correct Hono routing path:
   ```bash
   stripe listen --forward-to localhost:3000/api/subscriptions/webhook
   ```
3. **Copy the webhook secret** printed in the Stripe CLI console (it starts with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET` in your `.env.local` file.
4. Restart your development server:
   ```bash
   bun dev
   ```

### Webhook Architecture & Event Handlers
The webhook router is defined in [`src/app/api/[[...route]]/subscriptions.ts`](src/app/api/[[...route]]/subscriptions.ts). It processes the following events:

1. **`checkout.session.completed`**:
   - Triggered when the user completes their checkout session.
   - Extracts the `userId` from the session's metadata and retrieves the Stripe subscription object.
   - Inserts a new subscription record in the database linking the user to their `subscriptionId`.

2. **`invoice.payment_succeeded`**:
   - Triggered upon successful subscription renewal payments.
   - Retrieves the subscription ID via the parent details mapping (`invoice.parent.subscription_details.subscription`).
   - Retrieves the renewed subscription object from Stripe to find the updated billing cycle period (`subscription.items.data[0].current_period_end`).
   - Updates the subscription status and expiration date (`currentPeriodEnd`) in the database where the `subscriptionId` matches.


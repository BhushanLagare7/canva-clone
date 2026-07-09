<div align="center">

<img src="./public/logo.svg" alt="Stencil Logo" align="center" height="64" />

# Stencil

*An interactive graphic design platform and Canva clone.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38b2ac?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-black?style=flat-square&logo=bun)](https://bun.sh/)
[![Postgres](https://img.shields.io/badge/Postgres-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)

[Overview](#overview) • [Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Stripe Webhooks](#stripe-integration--webhooks)

</div>

## Overview

**Stencil** is a high-performance graphic design web application modeled after Canva. It provides an interactive canvas to create, edit, and export visual content directly from the browser. 

The project leverages a modern web stack including React 19, Next.js 16 App Router, Fabric.js for canvas operations, and integrates seamlessly with Stripe for subscription payments. 

> [!TIP]
> This project uses `bun` as its package manager. Ensure you have Bun installed to run the local development scripts.

## Features

- 🎨 **Interactive Canvas**: Powered by Fabric.js for seamless graphic editing.
- 🔐 **Authentication**: Secure user authentication handled by Auth.js (NextAuth).
- 💳 **Subscriptions**: Recurring payment flow integrated via Stripe and Hono.
- 💾 **Cloud Storage**: File and asset uploads managed by UploadThing.
- 🤖 **AI Integration**: HuggingFace Inference API for advanced AI design features.
- ⚡ **High Performance**: Built on Next.js 16 and React 19 for optimal rendering and speed.

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Database**: Neon (Serverless Postgres), Drizzle ORM
- **State Management**: Zustand
- **Canvas/Graphics**: Fabric.js
- **API**: Hono

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your local machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BhushanLagare7/canva-clone.git
   cd canva-clone
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and populate it with required secrets:
   - Database URL (Neon)
   - Stripe credentials
   - Auth.js secret
   - HuggingFace token
   - UploadThing tokens

4. **Database Setup:**
   Generate schema changes and apply migrations:
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

### Development

Start the development server:
```bash
bun run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

To view the database using Drizzle Studio:
```bash
bun run db:studio
```

## Stripe Integration & Webhooks

The project features a Stripe recurring subscription payment flow integrated via a Hono API router on Next.js.

### Environment Variables
Configure the following Stripe variables in your `.env.local` file:
```env
STRIPE_SECRET_KEY=sk_test_...       # Stripe Secret Key
STRIPE_PRICE_ID=price_...           # Price ID for your recurring plan
STRIPE_WEBHOOK_SECRET=whsec_...     # Webhook signature verification secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Local Development Setup & Testing
To forward Stripe webhook events to your local server during development:

1. **Start the local forwarder** targeting the correct Hono routing path:
   ```bash
   stripe listen --forward-to localhost:3000/api/subscriptions/webhook
   ```
2. **Copy the webhook secret** printed in the Stripe CLI console (starts with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.
3. Restart your development server.

### Webhook Architecture & Event Handlers
The webhook router processes the following key events:

1. **`checkout.session.completed`**:
   - Triggered when the user completes their checkout session.
   - Inserts a new subscription record in the database linking the user to their `subscriptionId`.

2. **`invoice.payment_succeeded`**:
   - Triggered upon successful subscription renewal payments.
   - Updates the subscription status and expiration date (`currentPeriodEnd`) in the database.

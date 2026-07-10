<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Project Overview
This project, named **Stencil**, is a Canva clone, providing an interactive graphic design platform built with a modern, high-performance web stack.

- **Production URL**: https://canva-clone-wine.vercel.app

### Key Technologies
- **Framework**: Next.js 16, React 19
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI primitives
- **Database & ORM**: Neon (Serverless Postgres), Drizzle ORM
- **State Management**: Zustand
- **Canvas/Graphics**: Fabric.js
- **Authentication**: Auth.js / NextAuth, Hono
- **Payments**: Stripe
- **File Uploads**: UploadThing
- **AI Integrations**: HuggingFace Inference API

## Setup Commands
- **Install dependencies**: `bun install`
- **Environment variables**: Ensure a `.env.local` file is set up with all required secrets (Database URL, Stripe, Auth secret, HuggingFace token, UploadThing tokens, etc.). **`NEXT_PUBLIC_APP_URL`** is also strictly required for canonical URL generation and correct robots/sitemap routing.
- **Generate DB schema changes**: `bun run db:generate`
- **Apply DB migrations**: `bun run db:migrate`

## Development Workflow
- **Start dev server**: `bun run dev` (Runs on `http://localhost:3000` by default)
- **View DB (Drizzle Studio)**: `bun run db:studio`
- The project uses `eslint` and `prettier` for code formatting. 

## Testing Instructions
- Currently, no dedicated test suites (like Vitest or Jest) are set up in `package.json`. Be sure to manually verify UI and logic changes in the browser.

## Code Style
- **Linting**: `bun run lint`
- **Fix Lint Issues**: `bun run lint:fix`
- Use TypeScript strictly.
- Keep components clean and modular. Use Tailwind CSS for styling and favor reusable `shadcn/ui` components where applicable.
- Adhere to Next.js App Router conventions.

## Build and Deployment
- **Build project**: `bun run build`
- **Start Production Server**: `bun run start`

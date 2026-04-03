# 🏌️ Digital Heroes — Golf Charity Subscription Platform

A full-stack web platform where golfers subscribe to monthly prize draws, record Stableford scores, and direct a portion of every payment to a charity of their choice. Built with **Next.js 16**, **React 19**, **Prisma**, **Stripe**, and **Tailwind CSS 4**.

---

## ✨ Features

| Area | Highlights |
|---|---|
| **Subscriptions** | Monthly & yearly plans via Stripe Checkout; webhook-driven status sync |
| **Stableford Scores** | Users record their last 5 rounds (1–45 each) — these double as draw entry numbers |
| **Monthly Draws** | Admin-run draws (random or score-weighted); 3/4/5-match tiers with transparent prize pool splits |
| **Charity Giving** | Configurable charity share (10–100%) per subscriber; charity directory with featured spotlight |
| **Winner Claims** | Proof upload, admin verification, and payout tracking |
| **Payment Allocation** | Every payment is split live: prize pool → charity → platform, viewable in the user dashboard |
| **Admin Panel** | Full admin dashboard for managing users, draws, charities, scores, claims, and payouts |
| **Glassmorphism UI** | Premium dark-mode design with glass effects, micro-animations, and responsive layouts |

---

## 🛠 Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Language** — TypeScript 5
- **Database** — PostgreSQL (via [Supabase](https://supabase.com/) or any Postgres host)
- **ORM** — [Prisma 6](https://www.prisma.io/) with migrations & seed
- **Payments** — [Stripe](https://stripe.com/) (Checkout, Webhooks)
- **Auth** — JWT-based authentication with bcrypt password hashing
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com/) + custom glass design system
- **Validation** — [Zod 4](https://zod.dev/)
- **Email** — [Resend](https://resend.com/) (optional; falls back to console logging)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node)
- A **PostgreSQL** database (Supabase free tier works great)
- A **Stripe** account (test mode is fine for development)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/digitalheros.git
cd digitalheros
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres URL (Supabase **pooler** on 6543 works for Vercel and the app). |
| `JWT_SECRET` | A strong random secret for signing auth tokens |
| `NEXT_PUBLIC_APP_URL` | Your app URL, e.g. `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | *(optional)* Resend API key for transactional emails |
| `EMAIL_FROM` | *(optional)* Sender address for emails |
| `ADMIN_SIGNUP_KEY` | *(optional)* Shared secret required to create an **admin** account via `/signup`; leave empty to disable admin signup |

> **⚠️ Important:** If your database password contains special characters (`@`, `:`, `/`, etc.), you must percent-encode them in the connection URL. See `.env.example` for examples.

### 4. Set up the database

```bash
# Run migrations
npm run db:migrate

# Seed with sample data (charities, admin user, etc.)
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔐 Admin access

| Item | Details |
|---|---|
| **Admin URL** | `/admin` — after login, admins are sent here automatically (member routes like `/dashboard` redirect admins to `/admin`). |
| **Login** | Go to `/login`, choose the **Admin** tab, and sign in with an account that has role `ADMIN`. |
| **Seed admin (local dev)** | After `npm run db:seed`, a default admin exists if the email was not already used: **Email:** `admin@digitalheroes.local` · **Password:** `Admin@123` · **Name:** Platform Admin. |

**Creating additional admins:** Set `ADMIN_SIGNUP_KEY` in `.env`, open `/signup`, select **Admin**, and enter the same key in the admin-key field. Without a key, admin signup is disabled.

**Admin panel sections** (single page with jump navigation; some URLs redirect to the matching anchor):

| Section | Purpose |
|---|---|
| **Reports** | Draw / financial reporting |
| **Charity payouts** | Charity payout tracking |
| **Users** | Subscribers, subscriptions, plan overrides |
| **Charities** | Directory, featured, metadata |
| **Draws** | Create and publish monthly draws |
| **Verification** | Winner claims, proof review, payouts |

**Shortcuts:** `/admin/users`, `/admin/charities`, `/admin/draws`, `/admin/winners`, and `/admin/reports` redirect to the corresponding section on `/admin`.

> **Production:** Change the seeded admin password (or remove the seed user and create admins via `ADMIN_SIGNUP_KEY`). Never rely on default credentials in production.

---

## 📁 Project Structure

```
digitalheros/
├── prisma/
│   ├── schema.prisma        # Database models & enums
│   ├── migrations/          # Prisma migration history
│   └── seed.ts              # Database seed script
├── public/                  # Static assets (favicon, images)
├── src/
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx       # Root layout (nav, fonts, metadata)
│   │   ├── globals.css      # Global styles & Tailwind config
│   │   ├── actions.ts       # Server Actions (forms, mutations)
│   │   ├── admin/           # Admin panel routes
│   │   ├── api/             # API routes (Stripe webhooks, etc.)
│   │   ├── charities/       # Charity directory page
│   │   ├── dashboard/       # User dashboard
│   │   ├── draws/           # Public draw results
│   │   ├── how-it-works/    # How it works page
│   │   ├── login/           # Login page
│   │   ├── profile/         # User profile
│   │   ├── scores/          # Score management
│   │   ├── signup/          # Registration page
│   │   ├── subscribe/       # Subscription plans & checkout
│   │   └── winnings/        # Winnings & claims
│   ├── components/          # Reusable React components
│   ├── generated/prisma/    # Auto-generated Prisma client
│   └── lib/                 # Utilities, constants, auth helpers
├── .env.example             # Environment variable template
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | Start Next.js dev server with hot reload |
| **Build** | `npm run build` | Production build |
| **Start** | `npm run start` | Start production server |
| **Lint** | `npm run lint` | Run ESLint |
| **Migrate (dev)** | `npm run db:migrate` | Create/apply migrations in development |
| **Migrate (prod)** | `npm run db:migrate:deploy` | Apply pending migrations to production DB (run locally or in CI when you ship schema changes — not part of Vercel build) |
| **Seed** | `npm run db:seed` | Seed database with sample data |

---

## 💳 Stripe Setup

1. Create a [Stripe account](https://dashboard.stripe.com/register) and grab your **test** API keys.
2. Set up a webhook endpoint pointing to `<your-url>/api/stripe/webhook`.
3. Listen for these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`.

For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 🗄️ Database Models

| Model | Purpose |
|---|---|
| `User` | Subscribers & admins with auth, charity preference, and charity share % |
| `Charity` | Organizations available for selection; supports featured spotlight |
| `Subscription` | Monthly/yearly plans with Stripe integration and lifecycle tracking |
| `PaymentAllocation` | Per-payment split: prize pool + charity + platform (in paise) |
| `PrizePoolContribution` | Monthly prize pool attribution (yearly plans spread across 12 months) |
| `Score` | Stableford round scores (1–45) that serve as draw entry numbers |
| `Draw` | Monthly draws with winning numbers, draft/published status |
| `WinnerClaim` | Match claims with proof upload, verification, and payout tracking |
| `PrizePoolLedger` | Monthly pool snapshot with tier breakdowns and rollover |
| `CharityDonation` | Donation records (subscription-based or one-time) |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/).
3. Add environment variables (at minimum `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, Stripe keys as needed). You do **not** need `DIRECT_URL`.
4. **Database migrations** are not run during the Vercel build. After pulling new migrations, run `npm run db:migrate:deploy` against production (from your machine with `DATABASE_URL` pointing at prod, or in CI). If Supabase’s pooler rejects migrate, use the **direct** (5432) connection string for that command only.
5. Set up your Stripe webhook to point to your production URL.

### Other Platforms

Any platform supporting Node.js 18+ and Next.js works. Just run:

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">
  Built with ❤️ for golf and giving
</p>

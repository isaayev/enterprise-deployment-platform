# Nexus Gaming Platform — Enterprise Production Deployment

[![CI/CD Pipeline](https://github.com/enterprise/enterprise-deployment-platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/enterprise/enterprise-deployment-platform/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18?logo=vitest)](https://vitest.dev/)

An enterprise-grade, high-scale gaming review, ratings, and analytics web platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, and hardened for production deployment across **Vercel**, **Docker containers**, and cloud environments.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Prerequisites & Quick Start](#prerequisites--quick-start)
5. [Environment Variables & Secret Management](#environment-variables--secret-management)
6. [Database Architecture & Production Readiness](#database-architecture--production-readiness)
7. [Automated Testing Suite](#automated-testing-suite)
8. [Docker Containerization](#docker-containerization)
9. [CI/CD Pipeline (GitHub Actions)](#cicd-pipeline-github-actions)
10. [Vercel Production Deployment](#vercel-production-deployment)
11. [Monitoring & Observability](#monitoring--observability)
12. [Enterprise Gaming Security Practices](#enterprise-gaming-security-practices)
13. [Disaster Recovery & Rollback Procedure](#disaster-recovery--rollback-procedure)
14. [License](#license)

---

## 1. Project Overview

The **Nexus Gaming Platform** provides a modern, performant space for gamers and critics to discover video games, submit detailed ratings and long-form reviews, vote on community feedback, and view real-time platform statistics.

### Key Capabilities

- **Catalog & Discovery**: Multi-filter game catalog searchable by title, developer, category, and play mode (Singleplayer, Co-op, Multiplayer) with Steam-style positive review percentage calculation.
- **Steam-Grade Reviews & Ratings**: Rich community reviews featuring 1–5 star ratings, recommendation sentiment, hours played, verified badges, and privacy-first anonymous review mode.
- **Helpful / Unhelpful Voting**: Anti-manipulation voting mechanics ensuring each authenticated player votes at most once per review.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions separating `GAMER`, verified `CRITIC`, and platform `ADMIN`.
- **Admin Command Center**: Server-guarded dashboard to manage game listings, inspect system health, and audit real-time security events.
- **Tamper-Evident Audit Trail**: Every sensitive operation (login, registration, game creation, deletion, rate-limit triggers) is recorded with client IP, timestamp, and status.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16.4.3 | App Router, Server Actions, Route Handlers, Standalone Output |
| **Frontend Library** | React 19.3.0 | Modern Hooks, Server Components, Client Hydration |
| **Language** | TypeScript 5 | Strict type-safety, zero compilation errors (`tsc --noEmit`) |
| **Styling** | Tailwind CSS 4 | Custom dark gaming theme, Neon glows, CSS Variables |
| **Data Fetching** | SWR 2.5.1 | Client-side reactive caching, revalidation, optimistic updates |
| **Authentication** | Jose 6.2.13 + bcryptjs 3.0.3 | Stateless JWT tokens, PBKDF2/bcrypt salted password hashing |
| **Validation** | Zod 4.6.7 | Strict runtime input & environment variable validation |
| **Testing** | Vitest 5.1.0 | Fast unit & integration test runner, 100% assertions |
| **Code Quality** | ESLint 9 | Next.js Core Web Vitals & TypeScript rulesets |
| **Deployment** | Vercel & Docker | Standalone multi-stage Alpine Linux container |

---

## 3. Architecture Overview

```
                            [ Web Browser / Client ]
                                       │
                      HTTPS / WAF / Cloudflare CDN
                                       │
                         [ Next.js Security Layer ]
                Security Headers (CSP, HSTS, X-Frame, CORS)
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
 [ Server Components & UI ]                                  [ API Route Handlers ]
 - / (Catalog & Discovery)                                  - /api/auth/* (Login/Register/Me)
 - /games/[id] (Details & Reviews)                          - /api/games/* (CRUD + Filtering)
 - /profile (Player Profile)                                - /api/reviews/* (Submit/Vote)
 - /admin (Audit Logs & Management)                         - /api/stats (Real-time telemetry)
         │                                                           │
         ▼                                                           ▼
 [ AuthContext & SWR ]                                       [ Rate Limiter ]
 (Client state & revalidation)                              (IP / User Token Bucket)
         │                                                           │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
                                [ Auth Guard ]
                         (jose JWT + HttpOnly Cookie)
                                       │
                               [ Audit Logger ]
                                       │
                        [ Enterprise Database Layer ]
                         src/lib/db.ts (Atomic Write)
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
 [ Local Dev: nexus-db.json ]                               [ Production Ready ]
  Atomic tmp-rename persistence                              PostgreSQL / Neon / RDS
```

---

## 4. Prerequisites & Quick Start

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/enterprise/enterprise-deployment-platform.git
cd enterprise-deployment-platform

# 2. Install dependencies cleanly
npm ci

# 3. Create your local environment file
cp .env.example .env.local

# 4. Generate a secure random JWT secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste the generated output into .env.local as JWT_SECRET
```

### Running Locally

```bash
# Start local development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 5. Environment Variables & Secret Management

Configuration is strictly typed and validated at runtime using **Zod** (`src/lib/env.ts`). If required variables are absent or invalid in production, the application halts immediately during startup.

| Variable | Description | Required in Prod? | Default (Dev) |
|---|---|:---:|---|
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | Yes | `development` |
| `JWT_SECRET` | Cryptographic secret for signing JWT sessions (≥ 32 chars) | **Yes** | Dev fallback (dev only) |
| `ADMIN_EMAIL` | Platform root administrator email address | **Yes** | `admin@enterprise.gg` |
| `ADMIN_USERNAME` | Platform root administrator username | **Yes** | `NexusAdmin` |
| `ADMIN_PASSWORD` | Platform root administrator initial password | **Yes** | Secure generated in `.env.local` |
| `DATABASE_URL` | PostgreSQL connection string for persistent cloud storage | Recommended | None (uses JSON DB) |
| `SENTRY_DSN` | Server-side Sentry error logging DSN endpoint | Optional | None |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side (browser) Sentry DSN endpoint | Optional | None |

> [!CAUTION]
> Never commit `.env`, `.env.local`, or any file containing plaintext credentials into Git. All local environment files are ignored by `.gitignore`.

---

## 6. Database Architecture & Production Readiness

### Development Storage (`data/nexus-db.json`)

For lightweight zero-configuration local development, the platform persists entities to `data/nexus-db.json` via an in-memory cache and atomic write mechanism (`write to temporary file -> rename to target`).

### Serverless & Cloud Limitations

On serverless platforms like Vercel or AWS Lambda:
- The filesystem is **read-only** outside `/tmp`.
- Files written to `/tmp` are **ephemeral** and erased when lambda instances recycle or scale to zero.
- Concurrent lambda instances do not share filesystem memory, which causes state divergence.

### PostgreSQL Migration Path

For production deployments, the application provides a direct migration schema and script:

```bash
# Execute the automated database migration script
npx tsx scripts/migrate-to-postgres.ts
```

The script includes the complete PostgreSQL DDL schema with relational constraints, foreign keys, cascades, and indexes for `users`, `games`, `reviews`, and `audit_logs`.

---

## 7. Automated Testing Suite

The project uses **Vitest** for fast unit and integration testing. Tests execute in a sandboxed node environment and do not modify production data.

```bash
# Run the complete test suite once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### Test Coverage Highlights

- **Input Validation**: Validates all Zod schemas (`registerSchema`, `loginSchema`, `createReviewSchema`, `createGameSchema`, `gameQuerySchema`).
- **Auth & Password Security**: Tests bcrypt hashing, salt generation, correct/incorrect password verification, and JWT token signing and tampering checks.
- **Rate Limiting**: Verifies token bucket limit enforcement, remaining counter degradation, and window expiry recovery.
- **Database Logic**: Tests entity retrieval, slug lookup, review creation, review filtering, and duplicate vote prevention.
- **Audit Logging**: Asserts structured audit event logging and retrieval.

---

## 8. Docker Containerization

The repository includes a production-hardened, multi-stage `Dockerfile` based on `node:20-alpine`:

- **Stage 1 (`deps`)**: Installs dependencies leveraging Docker cache layers.
- **Stage 2 (`builder`)**: Builds the Next.js standalone package with telemetry disabled.
- **Stage 3 (`runner`)**: Runs as an unprivileged system user (`nextjs:nodejs`, UID 1001) with standalone server output.

```bash
# 1. Build the Docker image
docker build -t nexus-gaming:latest .

# 2. Run the container with production environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET="your-64-character-production-jwt-secret-here" \
  -e ADMIN_EMAIL="admin@enterprise.gg" \
  -e ADMIN_USERNAME="NexusAdmin" \
  -e ADMIN_PASSWORD="YourStrongAdminPassword2026!" \
  --name nexus-platform \
  nexus-gaming:latest

# 3. Verify container status and logs
docker logs -f nexus-platform
```

---

## 9. CI/CD Pipeline (GitHub Actions)

The automated workflow is configured in `.github/workflows/ci-cd.yml`:

### Pull Request Quality Gate (Branch: `main`)

Every pull request must automatically pass the following sequence:
1. `npm ci`: Clean reproducible dependency installation.
2. `npm run lint`: ESLint code quality & Next.js Core Web Vitals checks.
3. `npx tsc --noEmit`: Strict TypeScript compiler type validation.
4. `npm test -- --run`: Complete Vitest automated test suite.
5. `npm run build`: Production Next.js compilation check.
6. `npm audit`: Security vulnerability audit for dependencies.

### Push to `main` Deployment Gate

When changes merge into `main`:
1. The full quality check suite executes.
2. Upon 100% success, the job deploys to **Vercel Production** using `amondnet/vercel-action@v25` with encrypted GitHub repository secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

### Recommended GitHub Branch Protection Settings

To ensure zero downtime and branch integrity:
- Require pull request reviews before merging (minimum 1 approval).
- Require status checks to pass before merging:
  - `Quality Checks`
- Require branches to be up to date before merging.
- Do not allow force pushes or deletions of `main`.

---

## 10. Vercel Production Deployment

### 1. Connecting the Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New Project** and import the GitHub repository.
3. Framework Preset: **Next.js**.

### 2. Configure Environment Variables
In the Vercel dashboard (**Settings > Environment Variables**), set:
- `JWT_SECRET`: Random 64-character hex string.
- `ADMIN_EMAIL`: Production administrator email.
- `ADMIN_USERNAME`: Production administrator username.
- `ADMIN_PASSWORD`: Strong administrator password.
- `DATABASE_URL`: (Optional) PostgreSQL cloud database URL.
- `SENTRY_DSN`: (Optional) Sentry monitoring DSN.

### 3. Deploy
Click **Deploy**. Every push to `main` triggers a production deployment, while pull requests automatically receive unique preview URLs.

---

## 11. Monitoring & Observability

### Core Web Vitals
The platform tracks Google's Core Web Vitals in real-time (`src/lib/monitoring.ts`):
- **LCP (Largest Contentful Paint)**: Target ≤ 2.5s.
- **INP (Interaction to Next Paint)**: Target ≤ 200ms.
- **CLS (Cumulative Layout Shift)**: Target ≤ 0.1.

### Sentry Error Tracking & PII Redaction
- Server and client exceptions are captured with automatic **PII scrubbing**.
- Passwords, hashes, JWT tokens, cookies, and authorization headers are replaced with `[REDACTED]` before leaving the server.

### Lighthouse Auditing
Run a Lighthouse audit locally or in Chrome DevTools:
```bash
npx lighthouse-ci collect --url=http://localhost:3000
```

---

## 12. Enterprise Gaming Security Practices

1. **HttpOnly & Secure Session Cookies**: JWT tokens are transmitted inside `HttpOnly`, `SameSite: Lax`, and `Secure` (production) cookies, preventing XSS-based session hijacking.
2. **Server-Side Authorization**: Every Admin API endpoint (`PUT /api/games/[id]`, `DELETE /api/games/[id]`, `GET /api/audit-logs`) independently verifies user identity and `role === 'ADMIN'` on the server.
3. **Enterprise Security Headers**: Configured in `next.config.ts`:
   - `Content-Security-Policy`: Restricts scripts, styles, and data origins.
   - `Strict-Transport-Security` (HSTS): 2-year duration with subdomains and preload.
   - `X-Frame-Options: DENY`: Prevents Clickjacking attacks.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
   - `Permissions-Policy`: Restricts camera, microphone, and geolocation.
4. **Token-Bucket Rate Limiting**: Throttles brute-force attempts on `/api/auth/login` (10 requests/min), `/api/auth/register` (10 requests/hour), and review submission spam.
5. **Review Vote Manipulation Guard**: Server tracks voters per review, rejecting multi-voting.

---

## 13. Disaster Recovery & Rollback Procedure

If a faulty deployment or configuration issue occurs in production:

### Instant Vercel Rollback
1. Open the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Deployments**.
3. Locate the previous healthy deployment.
4. Click the three dots `...` and select **Rollback to this Deployment**.
5. Vercel atomically repoints edge routing in under 5 seconds with zero server downtime.

### Git Revert Rollback
```bash
# Revert the faulty commit locally
git revert HEAD --no-edit

# Push to main to trigger the automated CI/CD pipeline
git push origin main
```

---

## 14. License

This project is licensed under the **ISC License**.

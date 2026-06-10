# FINDBASE — Lost & Found Platform

> AI-powered lost and found management system built with Next.js 16, MySQL, and Google Gemini.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Directory Structure](#directory-structure)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Core Feature Flows](#core-feature-flows)
- [API Reference](#api-reference)
- [Frontend Architecture](#frontend-architecture)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)

---

## Overview

Findbase is a full-stack campus/community lost and found platform. Users report lost or found items, receive AI-generated match suggestions, submit ownership claims, verify identity through a Q&A system, and communicate via a built-in chat interface.

Administrators have a dedicated portal to manage users, review item registries, oversee locked claims, and handle physical item hand-ins from walk-in finders.

**Key Features:**
- AI-powered item matching via Google Gemini 2.5 Flash
- JWT-based authentication with role-based access (`user` / `admin`)
- Image upload via Cloudinary (5 MB limit, JPEG/PNG/WebP/GIF)
- Full claim workflow: match → claim → verify → resolve
- Built-in chat system tied to claims
- Admin dashboard: user management, item registry, locked-claim resolution
- Rate limiting on all API routes (60 req/min per IP)
- Automated cleanup cron for resolved claim assets

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | App Router, SSR/CSR hybrid |
| Auth | `jsonwebtoken`, `bcryptjs` | Stateless JWT (7-day expiry), bcrypt password hashing |
| Database | MySQL (`mysql2/promise`) | Relational data, connection pool with retry logic |
| AI | `@google/genai` (Gemini 2.5 Flash) | Item comparison & match scoring (0–100) |
| Storage | Cloudinary | Image hosting for item photos |
| Utilities | `uuid`, `lucide-react` | ID generation, icon library |

---

## System Architecture

Findbase is a **monolithic Next.js application** — frontend and backend coexist in the same codebase. The App Router handles both page rendering and API routes.

```
Browser / Mobile Client
        │  HTTPS + JWT Bearer Token
        ▼
┌───────────────────────────────────────────┐
│           Next.js 16 App Router           │
│                                           │
│  ┌──────────────┐   ┌──────────────────┐  │
│  │  Page Routes  │   │   API Routes     │  │
│  │  /dashboard   │   │  /api/items      │  │
│  │  /claims      │   │  /api/matches    │  │
│  │  /admin       │   │  /api/claims     │  │
│  │  /chat        │   │  /api/chats      │  │
│  └──────────────┘   └──────────────────┘  │
│                                           │
│         Middleware (Edge Runtime)         │
│         Rate Limit + Auth Guard           │
└───────────────────────────────────────────┘
        │
   ┌────┴──────────────────────────┐
   ▼            ▼                  ▼
MySQL DB     Cloudinary        Gemini AI
(Data)       (Image CDN)       (Matching)
```

### Middleware Layer

Runs at the **Edge** before every matched request:

| Concern | Behaviour |
|---|---|
| Rate Limiting | 60 requests per IP per 60 s on all `/api/*` routes. Returns HTTP 429 on breach. *(In-memory — swap to Redis in production.)* |
| Auth Guard | Reads JWT from `Authorization` header or cookie. Redirects browser requests to `/login`; returns 401 for API calls. Excludes `/`, `/login`, `/register`, `/api/auth/*`. |

---

## Directory Structure

```
lost-and-found/
├── app/
│   ├── admin/                  # Admin portal pages
│   │   ├── page.js             # Dashboard overview
│   │   ├── users/              # User management
│   │   ├── management/         # Locked-claim resolution
│   │   └── registry/           # Physical item registry
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/          # POST – issue JWT
│   │   │   ├── logout/         # POST – stateless (client drops token)
│   │   │   ├── register/       # POST – create account
│   │   │   └── me/             # GET  – current user profile
│   │   ├── items/              # GET / POST items
│   │   ├── matches/            # POST (trigger AI match) / GET
│   │   ├── claims/             # POST / GET claims
│   │   ├── chats/              # POST / GET chats
│   │   ├── notifications/      # GET / PATCH notifications
│   │   ├── upload/             # POST image → Cloudinary
│   │   ├── verification/       # POST set Q&A for claim
│   │   ├── cleanup/            # GET cron – delete resolved assets
│   │   └── admin/
│   │       ├── items/          # All items (admin view)
│   │       ├── users/          # User list with email search
│   │       ├── locked-claims/  # Verification-locked claims
│   │       ├── registry/       # at_office inventory + delivery history
│   │       └── management/resolve/  # Check-in actions
│   ├── chat/                   # Chat UI page
│   ├── claims/                 # Claims list page
│   ├── dashboard/              # User dashboard
│   ├── items/                  # Lost / found item pages
│   ├── login/                  # Login page
│   ├── notifications/          # Notification centre
│   ├── profile/                # User profile page
│   ├── register/               # Registration page
│   ├── layout.js               # Root layout + AuthProvider
│   ├── page.js                 # Landing page
│   └── globals.css
├── components/
│   ├── Navbar.js               # User navigation (responsive + mobile drawer)
│   ├── AdminNavbar.js          # Admin navigation bar
│   └── ProtectedRoute.js       # Client-side auth guard HOC
├── context/
│   └── AuthContext.js          # Global auth state (React Context)
├── lib/
│   ├── auth.js                 # JWT sign/verify, bcrypt helpers
│   ├── db.js                   # MySQL pool with retry logic
│   ├── cloudinary.js           # Image upload helper
│   └── gemini.js               # AI match engine + rule-based fallback
├── middleware.js               # Edge: rate limit + auth guard
├── next.config.mjs
├── vercel.json
└── package.json
```

---

## Database Schema

All primary keys are **UUID v4 strings**. Timestamps use MySQL `NOW()`.

### Tables

| Table | Key Columns | Relationships |
|---|---|---|
| `users` | `id`, `name`, `email`, `password_hash`, `role`, `avatar_url` | 1:N items, claims |
| `items` | `id`, `user_id`, `type` (lost\|found), `name`, `category`, `location`, `date_occurred`, `image_url`, `status` | N:1 users; used in matches |
| `matches` | `id`, `lost_item_id`, `found_item_id`, `score`, `confidence`, `explanation` | 1:1 claims; FK to items |
| `claims` | `id`, `match_id`, `claimant_id`, `respondent_id`, `status` | 1:1 matches; 1:1 chats; 1:1 verification_questions |
| `chats` | `id`, `claim_id`, `user1_id`, `user2_id`, `is_active` | 1:N messages |
| `messages` | `id`, `chat_id`, `sender_id`, `content`, `image_url` | N:1 chats |
| `notifications` | `id`, `user_id`, `match_id`, `type`, `message`, `is_read` | N:1 users |
| `verification_questions` | `id`, `claim_id`, `question`, `answer_hash`, `attempts`, `is_locked` | 1:1 claims |
| `handin_confirmations` | `id`, `item_id`, `confirmed_at` | 1:1 items (found, at_office) |
| `delivery_records` | `id`, `item_id`, `full_name`, `id_number`, `phone`, `email`, `signature`, `notes`, `delivered_by`, `delivered_at` | N:1 items |

### Item Status Flow

```
active  ──(admin checks in)──▶  at_office  ──(delivered)──▶  resolved
  │                                                               ▲
  └──(lost item matched & confirmed)─────────────────────────────┘
```

---

## Authentication & Authorization

### JWT Flow

1. User POSTs credentials to `/api/auth/login`
2. Server validates password with `bcrypt.compare()`, signs a JWT (HS256, 7-day expiry)
3. Token returned to client — stored in `localStorage` and React Context
4. All subsequent requests send `Authorization: Bearer <token>`
5. Middleware verifies token at the edge for protected routes
6. Logout is **stateless** — client removes token from `localStorage`

### Role-Based Access Control

| Role | Access | Restriction |
|---|---|---|
| `user` | Dashboard, items, claims, chat, notifications, profile | Cannot access `/admin/*` |
| `admin` | Everything above + full admin portal | Admin API endpoints check `decoded.role === 'admin'` |

### ProtectedRoute Component

Client-side HOC wrapping pages that require authentication. Accepts an `adminOnly` prop to restrict admin-only pages. Reads from `AuthContext` and redirects accordingly.

---

## Core Feature Flows

### Reporting an Item

1. User fills out form: name, category, description, location, date, optional photo
2. Client POSTs to `/api/items`; server validates and optionally uploads image to Cloudinary
3. Item inserted into DB with `status: active`
4. User triggers AI matching via `POST /api/matches { item_id }`

### AI Matching (Gemini 2.5 Flash)

1. Fetch all `active` items of the **opposite type** from other users
2. For each candidate pair, call Gemini with a structured prompt comparing name, description, category, location, and date
3. Gemini returns: `{ score (0–100), confidence, explanation, recommendation }`
4. Pairs scoring **≥ 50** are saved to the `matches` table
5. Both the lost-item owner and found-item owner receive a `match_found` notification
6. A **rule-based fallback matcher** activates automatically if Gemini quota is exceeded

### Claim Workflow

```
1. Lost-item owner views a match → POST /api/claims { match_id }
   → claim created (status: pending)
   → found-item owner notified

2. Found-item owner sets a verification question → POST /api/verification
   → answer is bcrypt-hashed and stored
   → claim status: verifying
   → claimant notified to answer

3. Claimant answers the question
   → Correct: claim resolved, both items marked resolved
   → Wrong 3×: claim locked (is_locked = 1), admin alerted for manual review

4. Admin can:
   a) Review locked claims in /admin/management
   b) Check in physical items (existing post / new post / walk-in finder)
   c) Register delivery with recipient name, ID, and signature
```

### Chat System

- A chat room is created per claim (`POST /api/chats { claim_id }`)
- Both the claimant and respondent share the same chat room
- Messages support text and image attachments
- Chats are closed (`is_active = false`) when the claim resolves or is rejected
- The cleanup cron at `/api/cleanup` deletes message assets and verification data **24 h after resolution**

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Create user account |
| `POST` | `/api/auth/login` | None | Login; returns JWT + user object |
| `POST` | `/api/auth/logout` | None | Stateless logout (no-op) |
| `GET` | `/api/auth/me` | Bearer JWT | Get current user profile |

### Items

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/items` | Bearer JWT | Get user's items (filter by `?type=lost\|found`) |
| `POST` | `/api/items` | Bearer JWT | Report a new lost or found item |

### Matches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/matches` | Bearer JWT | Run AI match for an item |
| `GET` | `/api/matches` | Bearer JWT | Get user's matches (with claim status) |

### Claims

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/claims` | Bearer JWT | Create a claim on a match |
| `GET` | `/api/claims` | Bearer JWT | Get user's claims |

### Chats

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chats` | Bearer JWT | Create or retrieve chat for a claim |
| `GET` | `/api/chats` | Bearer JWT | List user's chats |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Bearer JWT | Get last 50 notifications |
| `PATCH` | `/api/notifications` | Bearer JWT | Mark all notifications as read |

### Upload & Verification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Bearer JWT | Upload image → returns Cloudinary URL |
| `POST` | `/api/verification` | Bearer JWT (respondent) | Set verification Q&A for a claim |

### Cleanup

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/cleanup` | `x-cleanup-secret` header | Cron: delete resolved claim assets |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/items` | Admin JWT | All items with user info |
| `GET` | `/api/admin/users` | Admin JWT | All non-admin users (searchable by `?email=`) |
| `GET` | `/api/admin/locked-claims` | Admin JWT | Locked claims pending/confirmed handover |
| `GET` | `/api/admin/registry` | Admin JWT | Inventory (`?tab=pending`) or delivery history (`?tab=history`) |
| `POST` | `/api/admin/management/resolve` | Admin JWT | Check-in actions: `checkin_existing` / `checkin_new` / `walkin_no_account` |

---

## Frontend Architecture

### AuthContext

Global auth state managed via React Context API. Exposed values and methods:

| Value / Method | Purpose |
|---|---|
| `user` | Current user object (`id`, `name`, `email`, `role`) |
| `token` | JWT string for API calls |
| `loading` | Boolean — hydrated from `localStorage` on mount |
| `login(token, user)` | Persists to `localStorage`, updates state, redirects by role |
| `logout()` | Clears `localStorage`, resets state, redirects to `/login` |
| `authFetch(url, opts)` | `fetch()` wrapper that auto-injects `Authorization` header |

### Navigation

Two separate navbar components based on role:

- **`Navbar.js`** — user-facing navigation with responsive hamburger drawer, animated logout overlay, and initials avatar
- **`AdminNavbar.js`** — fixed admin bar with active-link highlighting and Admin badge

### Route Protection

Two layers:

1. **Edge Middleware** — redirects unauthenticated requests at the network level
2. **`ProtectedRoute` HOC** — client-side fallback reading `AuthContext`; accepts `adminOnly` prop

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/dbname

# Auth
JWT_SECRET=your-super-secret-random-string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Cleanup cron
CLEANUP_SECRET=your-cleanup-secret
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8 database (PlanetScale, Railway, or self-hosted)
- Cloudinary account (free tier sufficient)
- Google AI Studio account for Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/lost-and-found.git
cd lost-and-found

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Fill in your credentials

# 4. Apply database schema
# Run your schema SQL against the MySQL database

# 5. Start development server
npm run dev
```

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Security Considerations

- JWT tokens expire after **7 days**; no refresh token — users must re-login after expiry
- Passwords hashed with **bcrypt** (cost factor 12)
- Rate limiting is **in-memory** — replace with Redis (e.g. Upstash) for multi-instance deployments
- Cloudinary uploads validated for type and size (max 5 MB) before uploading
- Verification answers are **bcrypt-hashed** before storage; never stored in plaintext
- Admin endpoints double-check `decoded.role` in addition to middleware auth
- Cleanup endpoint uses a separate `CLEANUP_SECRET` header, not a user JWT
- MySQL connections use **SSL** (`rejectUnauthorized: true`) with keepalive and connection pooling

---

## Deployment

The project includes a `vercel.json` for one-click Vercel deployment.

| Service | Recommendation | Notes |
|---|---|---|
| Hosting | Vercel | Zero-config Next.js deployment |
| Database | PlanetScale / Railway | MySQL-compatible, SSL support |
| Rate Limit Store | Upstash Redis | Replace in-memory `Map` in `middleware.js` |
| Cron Jobs | Vercel Cron / GitHub Actions | Hit `/api/cleanup` with the `CLEANUP_SECRET` header |
| Images | Cloudinary | Already integrated |

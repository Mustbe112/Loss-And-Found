# Findbase — Lost & Found System

A full-stack campus/community lost-and-found platform built with **Next.js 16**, **MySQL**, **Cloudinary**, and **Google Gemini AI**. Users report lost or found items, the AI matches them, and a structured claim/verification/chat workflow reunites owners with their belongings.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Core Workflows](#core-workflows)
- [Authentication & Security](#authentication--security)
- [AI Matching Engine](#ai-matching-engine)
- [Admin System](#admin-system)
- [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | JavaScript (ES Modules) |
| Database | MySQL 8 via `mysql2/promise` |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Image Storage | Cloudinary |
| AI Matching | Google Gemini 2.5 Flash (`@google/genai`) |
| Styling | Tailwind CSS v4 + inline styles |
| Deployment | Vercel (with cron jobs) |

---

## Project Structure

```
lost-and-found/
├── app/
│   ├── admin/                  # Admin-only pages
│   │   ├── page.js             # Admin dashboard
│   │   ├── users/              # User management
│   │   ├── management/         # Item check-in & walk-in flow
│   │   └── registry/           # Items at office + delivery history
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   ├── register/route.js
│   │   │   └── logout/route.js
│   │   ├── items/
│   │   │   ├── route.js        # GET (list), POST (create)
│   │   │   └── [id]/route.js   # GET, PATCH, DELETE
│   │   ├── matches/
│   │   │   ├── route.js        # POST (run AI match), GET (list)
│   │   │   └── [id]/route.js   # GET single match
│   │   ├── claims/
│   │   │   ├── route.js        # POST (create), GET (list)
│   │   │   └── [id]/route.js   # PATCH (update status)
│   │   ├── chats/
│   │   │   ├── route.js        # POST (create), GET (list)
│   │   │   └── [id]/
│   │   │       ├── route.js    # GET, DELETE chat
│   │   │       └── messages/route.js  # GET, POST messages
│   │   ├── verification/
│   │   │   ├── route.js        # POST (set question)
│   │   │   └── [claimId]/route.js  # GET, POST (answer)
│   │   ├── notifications/route.js
│   │   ├── upload/route.js
│   │   ├── health/route.js
│   │   ├── cleanup/route.js    # Cron job endpoint
│   │   ├── user/
│   │   │   ├── me/route.js
│   │   │   ├── delete/route.js
│   │   │   └── change-password/route.js
│   │   └── admin/
│   │       ├── items/route.js
│   │       ├── items/[id]/
│   │       │   ├── handin/route.js
│   │       │   └── deliver/route.js
│   │       ├── users/
│   │       │   ├── route.js
│   │       │   └── [id]/route.js
│   │       ├── locked-claims/route.js
│   │       ├── registry/
│   │       │   ├── route.js
│   │       │   └── [id]/deliver/route.js
│   │       ├── reports/
│   │       │   ├── route.js
│   │       │   └── [id]/route.js
│   │       └── management/
│   │           ├── resolve/route.js
│   │           └── search-user/route.js
│   ├── chat/                   # Chat UI
│   ├── claims/                 # Claims page
│   ├── dashboard/              # User dashboard
│   ├── items/
│   │   ├── lost/               # Browse lost items
│   │   └── found/              # Browse found items
│   ├── notifications/
│   ├── profile/
│   ├── login/
│   ├── register/
│   ├── layout.js               # Root layout with AuthProvider
│   ├── page.js                 # Landing page
│   └── globals.css
├── components/
│   ├── Navbar.js
│   ├── AdminNavbar.js
│   └── ProtectedRoute.js
├── context/
│   └── AuthContext.js          # Auth state + authFetch helper
├── lib/
│   ├── auth.js                 # JWT sign/verify + bcrypt helpers
│   ├── db.js                   # MySQL connection pool with retry logic
│   ├── cloudinary.js           # Image upload helper
│   └── gemini.js               # AI matching + fallback rule-based matcher
├── middleware.js               # Rate limiting + JWT auth guard
├── next.config.mjs
├── vercel.json                 # Cron job: daily cleanup at midnight
└── package.json
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client (Browser)                  │
│  Next.js App Router  ·  React 19  ·  AuthContext (JWT)  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Server (Vercel)                │
│                                                         │
│  middleware.js                                          │
│  ├── Rate limiter  (60 req/min per IP, in-memory)       │
│  └── JWT auth guard (protects /dashboard, /api/*)       │
│                                                         │
│  API Route Handlers (/app/api/**)                       │
│  ├── Auth routes      → lib/auth.js (JWT + bcrypt)      │
│  ├── Item routes      → lib/db.js (MySQL)               │
│  ├── Match routes     → lib/gemini.js (Gemini AI)       │
│  ├── Claim routes     → lib/db.js                       │
│  ├── Chat routes      → lib/db.js                       │
│  ├── Upload route     → lib/cloudinary.js               │
│  └── Admin routes     → lib/db.js (admin role required) │
└──────┬──────────────────┬────────────────┬──────────────┘
       │                  │                │
       ▼                  ▼                ▼
┌────────────┐  ┌──────────────────┐  ┌──────────────┐
│   MySQL 8  │  │   Cloudinary CDN │  │ Google Gemini│
│            │  │                  │  │  2.5 Flash   │
│ Connection │  │ lost-and-found/  │  │              │
│ pool (x10) │  │ folder           │  │ AI matching  │
│ w/ retry   │  │                  │  │ + fallback   │
└────────────┘  └──────────────────┘  └──────────────┘
```

### Request Lifecycle

1. Request hits `middleware.js` — rate limit check, then JWT verification
2. Public paths (`/`, `/login`, `/register`, `/api/auth/*`, `/api/health`) bypass auth
3. Protected API routes extract Bearer token, call `verifyToken()`, attach decoded payload
4. Route handlers query MySQL via the connection pool (`lib/db.js`)
5. Media uploads go to Cloudinary, returning a CDN URL stored in the DB
6. AI match requests go to Gemini; on quota failure, a rule-based fallback runs

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `name` | VARCHAR(255) | |
| `email` | VARCHAR(255) | Unique |
| `password_hash` | VARCHAR(255) | bcrypt, 12 rounds |
| `role` | ENUM | `user`, `admin` |
| `avatar_url` | VARCHAR(512) | Optional |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `items`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `user_id` | VARCHAR(36) | FK → users |
| `type` | ENUM | `lost`, `found` |
| `name` | VARCHAR(255) | |
| `description` | TEXT | Optional |
| `category` | VARCHAR(100) | |
| `location` | VARCHAR(255) | |
| `date_occurred` | DATE | |
| `image_url` | VARCHAR(512) | Cloudinary URL |
| `status` | ENUM | `active`, `resolved`, `at_office` |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `matches`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `lost_item_id` | VARCHAR(36) | FK → items |
| `found_item_id` | VARCHAR(36) | FK → items |
| `score` | INT | 0–100, from Gemini |
| `confidence` | ENUM | `Low`, `Medium`, `High` |
| `explanation` | TEXT | AI-generated reasoning |
| `status` | ENUM | `pending`, `resolved`, `rejected` |
| `created_at` | DATETIME | |

### `claims`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `match_id` | VARCHAR(36) | FK → matches |
| `claimant_id` | VARCHAR(36) | FK → users (lost item owner) |
| `respondent_id` | VARCHAR(36) | FK → users (found item owner) |
| `status` | ENUM | `pending`, `verifying`, `confirmed`, `rejected`, `disputed`, `completed` |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `verification_questions`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `claim_id` | VARCHAR(36) | FK → claims |
| `question` | TEXT | Set by found item owner |
| `answer_hash` | VARCHAR(255) | bcrypt hash |
| `attempts` | INT | Default 0, max 3 |
| `is_passed` | TINYINT | 0 / 1 |
| `is_locked` | TINYINT | Locked after 3 failed attempts |
| `created_at` | DATETIME | |

### `chats`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `claim_id` | VARCHAR(36) | FK → claims |
| `user1_id` | VARCHAR(36) | Claimant |
| `user2_id` | VARCHAR(36) | Respondent |
| `is_active` | TINYINT | 0 / 1 |
| `created_at` | DATETIME | |

### `messages`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `chat_id` | VARCHAR(36) | FK → chats |
| `sender_id` | VARCHAR(36) | FK → users |
| `content` | TEXT | |
| `image_url` | VARCHAR(512) | Optional |
| `is_read` | TINYINT | 0 / 1 |
| `created_at` | DATETIME | |

### `notifications`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `user_id` | VARCHAR(36) | FK → users |
| `match_id` | VARCHAR(36) | Optional FK → matches |
| `type` | ENUM | `match_found`, `claim_request`, `claim_rejected`, `chat_message` |
| `message` | TEXT | |
| `is_read` | TINYINT | 0 / 1 |
| `created_at` | DATETIME | |

### `handin_confirmations`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `item_id` | VARCHAR(36) | FK → items (found item) |
| `claim_id` | VARCHAR(36) | FK → claims |
| `confirmed_at` | DATETIME | |

### `delivery_records`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `item_id` | VARCHAR(36) | FK → items |
| `claim_id` | VARCHAR(36) | Optional FK → claims |
| `full_name` | VARCHAR(255) | Recipient's full name |
| `id_number` | VARCHAR(100) | National/student ID |
| `phone` | VARCHAR(50) | |
| `email` | VARCHAR(255) | Optional |
| `signature` | TEXT | Base64 PNG, optional |
| `notes` | TEXT | Admin notes |
| `delivered_at` | DATETIME | |
| `delivered_by` | VARCHAR(36) | FK → users (admin) |

### `admin_reports`

| Column | Type | Notes |
|---|---|---|
| `id` | VARCHAR(36) | UUID |
| `reporter_id` | VARCHAR(36) | FK → users |
| `claim_id` | VARCHAR(36) | Optional FK → claims |
| `reason` | TEXT | |
| `status` | ENUM | `open`, `under_review`, `resolved` |
| `admin_notes` | TEXT | |
| `created_at` | DATETIME | |

### Entity Relationship Overview

```
users ──< items ──< matches >── items
                       │
                    claims
                    ├── verification_questions
                    ├── chats ──< messages
                    └── handin_confirmations
                            │
                    delivery_records

users ──< notifications
users ──< admin_reports
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/logout` | Public | Stateless (client deletes token) |

### Items

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | User | List own items (`?type=lost\|found`) |
| POST | `/api/items` | User | Report a lost or found item |
| GET | `/api/items/[id]` | User | Get single item |
| PATCH | `/api/items/[id]` | Owner | Update item fields or status |
| DELETE | `/api/items/[id]` | Owner | Delete item (not if resolved) |

### Matches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/matches` | User | Run AI matching for an item |
| GET | `/api/matches` | User | List matches involving the user |
| GET | `/api/matches/[id]` | Participant | Get single match with full item details |

### Claims

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/claims` | Lost owner | Create a claim on a match |
| GET | `/api/claims` | User | List own claims (claimant or respondent) |
| PATCH | `/api/claims/[id]` | Participant | Update claim status |

### Verification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/verification` | Found owner | Set a verification question |
| GET | `/api/verification/[claimId]` | Participant | Get verification status |
| POST | `/api/verification/[claimId]` | Claimant | Submit an answer |

### Chats & Messages

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/chats` | Participant | Create or fetch existing chat |
| GET | `/api/chats` | User | List all chats |
| GET | `/api/chats/[id]` | Participant | Get chat details |
| DELETE | `/api/chats/[id]` | Participant | Delete chat + messages |
| GET | `/api/chats/[id]/messages` | Participant | Fetch messages (marks as read) |
| POST | `/api/chats/[id]/messages` | Participant | Send a message |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | User | Get last 50 notifications |
| PATCH | `/api/notifications` | User | Mark all as read |

### User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/user/me` | User | Get own profile |
| POST | `/api/user/change-password` | User | Change password |
| DELETE | `/api/user/delete` | User | Delete account + all data |
| POST | `/api/upload` | User | Upload image to Cloudinary (≤5MB) |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/items` | All items with user info |
| GET | `/api/admin/users` | All non-admin users |
| GET/PATCH/DELETE | `/api/admin/users/[id]` | View, edit, or delete a user |
| GET | `/api/admin/locked-claims` | Claims locked by failed verification |
| PATCH | `/api/admin/items/[id]/handin` | Confirm or reject physical hand-in |
| POST/GET | `/api/admin/items/[id]/deliver` | Record item delivery |
| GET | `/api/admin/registry` | Items at office (`?tab=pending\|history`) |
| GET/POST | `/api/admin/registry/[id]/deliver` | Lookup user + record delivery |
| GET/POST | `/api/admin/reports` | View reports / submit a report |
| PATCH | `/api/admin/reports/[id]` | Update report status |
| POST | `/api/admin/management/resolve` | Check in items (existing/new/walk-in) |
| GET | `/api/admin/management/search-user` | Search users by name or email |
| GET | `/api/health` | DB health check |
| GET | `/api/cleanup` | Cron: clean up old resolved chats |

---

## Core Workflows

### 1. Item Reporting & AI Matching

```
User reports item (POST /api/items)
        │
        ▼
User triggers matching (POST /api/matches)
        │
        ├── Query opposite-type active items from DB
        ├── For each candidate: call Gemini 2.5 Flash
        │       └── On quota error: use rule-based fallback
        │
        ├── score >= 50 → INSERT into matches table
        └── Notify both users via notifications table
```

### 2. Claim & Verification Flow

```
Lost item owner sees match → clicks Claim
        │
        ▼
POST /api/claims  (claimant_id = lost owner, respondent_id = found owner)
        │
        ▼
Found owner sets verification question (POST /api/verification)
  claim.status → 'verifying'
        │
        ▼
Lost owner answers (POST /api/verification/[claimId])
  ├── Correct → is_passed = 1, chat unlocked
  └── Wrong   → attempts++
                  └── attempts >= 3 → is_locked = 1, admin notified
                                         (item goes to Admin Locked Claims)
```

### 3. Physical Handover (Admin)

```
Verification locked (3 failed attempts)
        │
        ▼
Admin sees item in Locked Claims panel
        │
        ▼
Found item owner brings item to office
  PATCH /api/admin/items/[id]/handin  { action: 'confirm' }
  items.status → 'at_office'
        │
        ▼
Claimant visits office, presents ID
  POST /api/admin/registry/[id]/deliver
  ├── INSERT delivery_records (full_name, id_number, phone, signature)
  ├── items.status → 'resolved' (found item)
  ├── items.status → 'resolved' (matched lost item)
  └── claims.status → 'completed'
```

### 4. Claim Rejection & Re-matching

```
Respondent rejects claim (PATCH /api/claims/[id] { status: 'rejected' })
        │
        ├── matches.status → 'rejected'
        ├── Both items → status = 'active'
        ├── Notify claimant
        └── Re-run AI matching against all active found items
                └── New match records inserted for score >= 50
```

### 5. Walk-in (No Account)

```
Finder has no account and brings item directly to office
        │
        ▼
Admin uses Management page → Walk-in flow
  POST /api/admin/management/resolve { action: 'walkin_no_account' }
  └── Creates found item under admin's user_id
       description includes finder contact info
       status = 'at_office'
```

---

## Authentication & Security

### JWT Strategy

- Tokens are signed with `JWT_SECRET`, valid for **7 days**
- Stored client-side in `localStorage` (accessed via `AuthContext`)
- Sent as `Authorization: Bearer <token>` on every API request
- `middleware.js` verifies tokens for protected routes before they reach handlers
- Logout is stateless — the client removes the token from localStorage

### Password Security

- Passwords hashed with **bcrypt at 12 rounds** on registration
- Password changes require the current password to be verified first
- Verification question answers are also bcrypt-hashed (10 rounds)

### Rate Limiting

- Applied to all `/api/*` routes in `middleware.js`
- **60 requests per minute per IP** (in-memory Map; replace with Redis for multi-instance)
- Returns `429 Too Many Requests` when exceeded

### Role-Based Access

- `role: 'user'` — standard access to own data only
- `role: 'admin'` — full access to all admin routes; enforced in each admin route handler

### Database Connection Resilience

`lib/db.js` implements a connection pool with:
- **10 concurrent connections** max
- **3 retry attempts** with exponential backoff (150ms, 300ms, 600ms)
- Automatic pool reset on `ECONNRESET`, `ETIMEDOUT`, `PROTOCOL_CONNECTION_LOST`
- Keep-alive pings every 10 seconds
- Idle connection recycling after 60 seconds

---

## AI Matching Engine

Located in `lib/gemini.js`, using `gemini-2.5-flash`.

### Scoring Guide

| Score | Meaning |
|---|---|
| 80–100 | Very likely the same item |
| 50–79 | Possibly the same item |
| 0–49 | Unlikely — not stored |

Only matches with **score ≥ 50** are persisted. The AI returns a JSON object:

```json
{
  "score": 82,
  "confidence": "High",
  "explanation": "Same category, matching location, dates within 2 days.",
  "recommendation": "match"
}
```

### Fallback Rule-Based Matcher

When Gemini quota is exceeded, a deterministic scorer runs:

| Signal | Points |
|---|---|
| Same category | +40 |
| Common name words (>2 chars each) | +15 per word, max 30 |
| Exact location match | +20 |
| Partial location match | +10 |
| Date within 1 day | +10 |
| Date within 7 days | +5 |

---

## Admin System

The admin panel (`/admin/*`) provides four main sections:

### Dashboard
Overview stats: total items, active claims, matches, recent activity.

### Users (`/admin/users`)
- List, search, edit, and delete user accounts
- View full user activity: items posted, claims made, reports filed

### Management (`/admin/management`)
Three check-in modes for physical item intake:
- **Existing item** — user already posted it; mark as `at_office`
- **New item** — user has an account but didn't post; admin creates the record
- **Walk-in** — finder has no account; admin creates item under their own user ID with finder contact info in description

### Item Registry (`/admin/registry`)
- **Pending tab** — all `at_office` items awaiting pickup
- **History tab** — all delivery records with recipient identity info
- Admin records physical delivery (name, ID number, phone, optional signature)
- On delivery: found item → `resolved`, matched lost item → `resolved`, claim → `completed`

### Locked Claims
Items where claimant failed verification 3 times. Admin mediates the physical handover process.

### Reports
User-submitted dispute reports with full claim/item/user context. Admin can update status (`open` → `under_review` → `resolved`) and add notes.

---

## Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/dbname

# Auth
JWT_SECRET=your_jwt_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Cron job protection
CLEANUP_SECRET=your_cleanup_secret
```

### Cron Job

Defined in `vercel.json`, runs daily at midnight UTC:

```
GET /api/cleanup
```

Cleans up chats from claims resolved more than 24 hours ago — deletes messages, removes Cloudinary images, and closes the chat record.

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

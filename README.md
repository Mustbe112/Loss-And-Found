# Lost and Found System

A full-stack web application that helps users report and recover lost items using AI-powered matching and real-time private chat.

---

## Features

- User Authentication — Register and log in with email and password
- Report Lost & Found Items — Submit detailed reports with descriptions and images
- AI Matching — Automatically matches lost and found reports using Gemini AI
- Smart Notifications — Notifies both parties when a potential match is detected
- Private Chat — A one-on-one chatbox opens exclusively between matched users
- Admin Dashboard — Manage users, items, reports, and claims
- Image Upload — Cloudinary integration for item photos
- Claim & Verification System — Users can claim matched items with a verification step

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | JavaScript |
| Database | MySQL (via custom `db.js`) |
| Authentication | JWT (`auth.js`) |
| AI Matching | Google Gemini (`gemini.js`) |
| Image Upload | Cloudinary (`cloudinary.js`) |
| Deployment | Vercel |
| Styling | Tailwind CSS |

---

## Project Structure

```
lost-and-found/
├── app/
│   ├── admin/                  # Admin pages (management, registry, reports, users)
│   ├── api/
│   │   ├── admin/              # Admin API routes (items, claims, users, etc.)
│   │   ├── auth/               # Login, logout, register, profile
│   │   ├── chats/              # Chat API routes
│   │   ├── claims/             # Claim submission and management
│   │   ├── items/              # Lost & found item routes
│   │   ├── matches/            # AI match routes
│   │   ├── notifications/      # Notification routes
│   │   ├── upload/             # Image upload (Cloudinary)
│   │   ├── user/               # Change password, delete account
│   │   └── verification/       # Claim verification
│   ├── chat/[id]/              # Private chat page
│   ├── claims/new/             # New claim page
│   ├── dashboard/              # User dashboard
│   ├── items/found/            # Browse found items
│   ├── items/lost/             # Browse lost items
│   ├── login/                  # Login page
│   ├── notifications/          # Notifications page
│   ├── profile/                # User profile
│   └── register/               # Registration page
├── components/
│   ├── AdminNavbar.js
│   ├── Navbar.js
│   └── ProtectedRoute.js
├── context/                    # React context (auth state)
├── lib/
│   ├── auth.js                 # JWT utilities
│   ├── cloudinary.js           # Image upload config
│   ├── db.js                   # Database connection
│   └── gemini.js               # Gemini AI integration
├── middleware.js               # Route protection middleware
└── public/                     # Static assets
```

---

## Getting Started

### Prerequisites

- Node.js 
- MySQL database
- Cloudinary account
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lost-and-found.git
cd lost-and-found

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Authentication
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. **Register / Login** — User creates an account and logs in securely.
2. **Report an Item** — User reports a lost or found item with a description and optional photo.
3. **AI Matching** — Gemini AI compares the new report against existing reports and looks for description matches.
4. **Notification** — If a match is found, both users are notified.
5. **Private Chat** — A private chatbox is unlocked between the two matched users to coordinate return of the item.
6. **Claim & Verify** — The owner submits a claim, which goes through a verification step before the item is marked as returned.

---

## Roles

| Role | Access |
|------|--------|
| User | Report items, view matches, chat, manage profile |
| Admin | Full access to manage all users, items, reports, and claims |

---

## Deployment

This project is deployed on **Vercel**. See `vercel.json` for configuration.

```bash
vercel deploy
```

---

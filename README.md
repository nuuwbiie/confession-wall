<div align="center">

# 🧱 Confession Wall

**A safe, anonymous space to share what's on your heart.**

*A beautifully crafted anonymous confession wall designed for workplace emotional wellness — where every card is a piece of someone's heart, shared in safe silence.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**🌐 Bahasa Lain / Other Languages:**
[![EN](https://img.shields.io/badge/🇺🇸-English-blue)](./README.md)
[![ID](https://img.shields.io/badge/🇮🇩-Indonesia-red)](./README.id.md)
[![ZH](https://img.shields.io/badge/🇨🇳-简体中文-green)](./README.zh-CN.md)

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [📡 API](#-api-reference) · [🤝 Contributing](./CONTRIBUTING.md) · [📄 License](#-license)

</div>

---

## 📸 Screenshots

<!-- Add your screenshots here! Example: -->
<!--
| The Wall | Confession Form | HR Dashboard |
|----------|----------------|---------------|
| ![Wall](./docs/screenshots/wall.png) | ![Form](./docs/screenshots/form.png) | ![Dashboard](./docs/screenshots/dashboard.png) |
-->

> 🎯 **Tip:** Take screenshots of your running app and place them in `docs/screenshots/`, then uncomment the table above.

---

## ✨ Features

### 🎨 Visual Voice — Font Picker
Every confession deserves its own voice. Choose from 4 carefully curated fonts that change how your words feel:

| Font | Typeface | Vibe |
|------|----------|------|
| **Sans** | Inter | Modern & direct |
| **Serif** | Playfair Display | Reflective & literary |
| **Mono** | Fira Code | Raw & unfiltered |
| **Handwriting** | Dancing Script | Personal & intimate |

### 🧱 Masonry Grid Wall
Confessions are displayed in a beautiful, responsive masonry grid layout — just like sticky notes on a real wall. Each card breathes with its own rhythm based on content length.

### ❤️ Like System
- Optimistic UI updates for instant feedback
- Toggle like/unlike with a single tap
- Server-synced like counts
- Login-gated with graceful fallback to login modal

### 💬 Comment System
- Threaded comments on any confession
- Modal-based comment UI
- Comment counts on wall cards
- Only available when the author allows replies

### 🔒 Privacy Controls
Every confession gives the author full control:

| Setting | Description |
|---------|-------------|
| **Public / Private** | Public confessions appear on The Wall; private ones go only to HR |
| **Allow Replies** | Toggle whether others can comment on your confession |
| **Anonymous Identity** | Hide or show your username — your choice, your safety |

### 🛡️ Content Moderation
- **Profanity Filter** — Automatic detection of Indonesian & English bad words before submission
- **Pre-Publish Review** — New confessions start as `pending` and need HR approval
- **Auto-Publish Timer** — Pending confessions auto-publish after 3 hours if not reviewed
- **HR Moderation** — Approve, reject, or delete from the dashboard

### 🔔 Notification System
- Real-time notification bell in the header
- Unread count badge
- Notifications when HR replies privately to your confession
- Mark as read with a single click
- Notification modal to view HR replies in context

### 🏢 HR Dashboard
A full-featured admin dashboard for HR teams:

| Feature | Description |
|---------|-------------|
| **Metric Cards** | Total confessions, pending count, emotional wellness %, published count |
| **Tab Navigation** | Switch between "Needs Review" and "Filtered" views |
| **Bulk Actions** | Approve all pending public confessions with one click |
| **Individual Actions** | Approve, reject, delete, or send private HR reply |
| **Private HR Replies** | Respond confidentially — only the confession author sees it |
| **Pagination** | Clean pagination for both tabs (20 items/page) |
| **Responsive** | Desktop table view + mobile card view |

### 👤 Authentication
- Supabase Auth integration
- Login modal with smooth UX
- Admin detection via `is_admin` profile flag
- Dynamic navigation (Dashboard link only for admins)
- User confession history in avatar dropdown

### 📝 Writing Experience
- **Auto-save Draft** — Never lose your words; drafts persist in localStorage
- **Live Preview** — See exactly how your confession will look before submitting
- **Character Counter** — Visual progress bar with warning/danger states
- **Validation** — Minimum 10 characters, maximum 2000 characters

### 📱 Responsive Design
- Mobile-first approach with touch-friendly targets
- Hamburger menu with slide-down navigation drawer
- Responsive masonry grid (1 column mobile → multi-column desktop)
- Floating Action Button for quick confession writing

### 🦴 Loading & Error States
- Skeleton card grid during data loading
- Error states with retry buttons
- Empty states with encouraging messages
- Spinner animations for async actions

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router & API Routes |
| [React 19](https://react.dev/) | UI library with latest features |
| [Supabase](https://supabase.com/) | Authentication, PostgreSQL database, Row Level Security |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [TypeScript 5](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Material Symbols](https://fonts.google.com/icons) | Icon system |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm** or **yarn**
- A [Supabase](https://supabase.com/) account (free tier works!)

### 1. Clone the Repository

```bash
git clone https://github.com/nuuwbiie/confession-wall.git
cd confession-wall
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> 💡 Get these from your [Supabase Dashboard → Settings → API](https://app.supabase.com/project/_/settings/api)

### 4. Set Up Supabase Database

1. Go to your Supabase project's **SQL Editor**
2. Copy and run the contents of [`supabase/migration.sql`](./supabase/migration.sql)
3. Optionally run [`supabase/fix_admin_column.sql`](./supabase/fix_admin_column.sql) if needed

### 5. Enable Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure your site URL and redirect URLs

### 6. Create an Admin User

1. Sign up a new user through the app's login modal
2. In Supabase SQL Editor, set the user as admin:

```sql
UPDATE profiles SET is_admin = true WHERE username = 'your-username';
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start confessing! 🎉

### 8. (Optional) Set Up Auto-Publish Cron

To auto-publish pending confessions after 3 hours, set up a cron job that calls:

```
GET https://your-domain.com/api/cron/publish
```

You can use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs), [Supabase Edge Functions](https://supabase.com/docs/guides/functions), or any external cron service.

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key (client-side safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only, bypasses RLS) |

> ⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client!** It's only used in server-side API routes.

---

## 📂 Project Structure

```
confession-wall/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home — The Wall (masonry grid)
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── confess/            # Write a confession page
│   │   ├── dashboard/          # HR admin dashboard
│   │   ├── login/              # Login page
│   │   ├── auth/               # Auth callback handler
│   │   └── api/                # API Routes
│   │       ├── confessions/    # CRUD + like + comments + HR reply
│   │       ├── moderate/       # Admin moderation actions
│   │       ├── notifications/  # Notification endpoints
│   │       ├── auth/           # Admin check
│   │       ├── comments/       # Comment CRUD
│   │       ├── user/           # User-specific data
│   │       └── cron/           # Auto-publish cron endpoint
│   ├── components/             # React components
│   │   ├── Header.tsx          # Navigation, auth, notifications
│   │   ├── WallCard.tsx        # Confession card with like/comment
│   │   ├── ConfessionForm.tsx  # Write form with all controls
│   │   ├── ConfessionPreview.tsx
│   │   ├── CommentModal.tsx    # Comment thread modal
│   │   ├── NotificationModal.tsx
│   │   ├── LoginModal.tsx      # Auth modal
│   │   ├── LoginModalWrapper.tsx
│   │   ├── AuthProvider.tsx    # Global auth context
│   │   ├── MasonryGrid.tsx    # CSS masonry layout
│   │   ├── SkeletonCard.tsx    # Loading skeleton
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useConfessionForm.ts  # Form state management with useReducer
│   └── lib/
│       ├── constants.ts        # Fonts, limits, dummy data
│       ├── profanity-filter.ts # Indonesian + English bad word filter
│       ├── username-generator.ts
│       ├── auth-helpers.ts
│       ├── actions/
│       └── supabase/
│           └── client.ts       # Supabase browser client
├── supabase/
│   ├── migration.sql           # Full database schema
│   └── fix_admin_column.sql   # Admin column fix
├── .env.example                # Environment variable template
├── CONTRIBUTING.md             # Contribution guide
└── LICENSE                     # MIT License
```

---

## 🗄️ Database Schema

### Entity Relationship

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│  profiles    │       │   confessions     │       │    likes      │
├─────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK, FK) │──┐    │ id (PK)          │───┐   │ id (PK)      │
│ username    │  │    │ content           │   │   │ confession_id│
│ is_admin    │  └───▶│ user_id (FK)      │   └──▶│ user_id (FK) │
│ created_at  │       │ font              │       │ created_at   │
└─────────────┘       │ is_public         │       └──────────────┘
                      │ allow_replies     │
                      │ is_anonymous      │       ┌──────────────┐
                      │ status (enum)     │       │   comments   │
                      │ likes             │       ├──────────────┤
                      │ published_at      │       │ id (PK)      │
                      └──────┬───────────┘       │ confession_id│
                             │                    │ content      │
                     ┌───────┴───────┐            │ user_id (FK) │
                     │               │            │ created_at   │
              ┌──────┴─────┐  ┌─────┴──────┐     └──────────────┘
              │ hr_replies │  │notifications│
              ├────────────┤  ├────────────┤
              │ id (PK)    │  │ id (PK)    │
              │confession_id│  │ user_id   │
              │ content    │  │confession_id│
              │ admin_id   │  │ type       │
              │ created_at │  │ content    │
              └────────────┘  │ is_read    │
                              │ created_at │
                              └────────────┘
```

### Status Enum (`confession_status`)

| Status | Description |
|--------|-------------|
| `pending` | Awaiting HR review (auto-publishes after 3h) |
| `published` | Visible on The Wall |
| `private` | Only visible to HR (not shown on Wall) |
| `rejected` | Filtered out by HR |

### Row Level Security (RLS)

All tables have RLS enabled with carefully scoped policies:

- **Published confessions** — readable by everyone
- **Own confessions** — users can view their own pending/private posts
- **Likes** — anyone can view; authenticated users can like/unlike
- **Comments** — viewable on published confessions; insertable when replies allowed
- **HR Replies** — visible only to confession owner and admin
- **Notifications** — users can only see and update their own

---

## 📡 API Reference

### Confessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/confessions` | Fetch confessions by status |
| `POST` | `/api/confessions` | Submit a new confession |
| `POST` | `/api/confessions/[id]/like?action=like\|unlike` | Toggle like |
| `GET` | `/api/confessions/[id]/like` | Check if current user liked |
| `GET` | `/api/confessions/[id]/comments` | Get comments for a confession |
| `POST` | `/api/confessions/[id]/comments` | Add a comment |
| `POST` | `/api/confessions/[id]/hr-reply` | HR private reply (admin only) |

#### `GET /api/confessions` Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `published` | Comma-separated statuses (`published`, `pending`, `private`, `rejected`) |
| `limit` | number | `50` | Results per page |
| `offset` | number | `0` | Pagination offset |

#### `POST /api/confessions` Body

```json
{
  "content": "Your confession text...",
  "font": "sans | serif | mono | handwriting",
  "is_public": true,
  "allow_replies": true,
  "is_anonymous": true
}
```

### Moderation (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/moderate` | Perform moderation actions |

#### `POST /api/moderate` Body

```json
// Approve a single confession
{ "action": "approve", "confession_id": "uuid" }

// Reject a confession
{ "action": "reject", "confession_id": "uuid" }

// Delete a confession
{ "action": "delete", "confession_id": "uuid" }

// Approve all pending public confessions
{ "action": "approve_all" }

// Reply as admin
{ "action": "reply", "confession_id": "uuid", "message": "..." }
```

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Get user's notifications |
| `PUT` | `/api/notifications/[id]/read` | Mark notification as read |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/check-admin` | Check if current user is admin |
| `GET` | `/api/user/confessions` | Get current user's confessions |

### Cron

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cron/publish` | Auto-publish pending confessions older than 3 hours |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/new)
3. Add your environment variables in Vercel project settings
4. Deploy!

For the auto-publish cron, add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Other Platforms

This is a standard Next.js application — it can be deployed to any platform that supports Node.js:

```bash
npm run build
npm start
```

---

## 🗺️ Roadmap

Ideas for future development:

- [ ] 🌙 Dark mode toggle
- [ ] 🏷️ Tags/categories for confessions
- [ ] 📊 Analytics dashboard for HR (sentiment analysis, trend charts)
- [ ] 🔗 Shareable confession links
- [ ] 📧 Email notifications for HR replies
- [ ] 🎨 Custom color themes for confession cards
- [ ] 📱 PWA support with push notifications
- [ ] 🤖 AI-powered content categorization
- [ ] 🌐 i18n / multi-language support
- [ ] 💾 Image attachment support

---

## 🤝 Contributing

We welcome contributions! Please read our [**Contributing Guide**](./CONTRIBUTING.md) for details on:

- 🍴 How to fork and set up the project
- 🌿 Branch naming conventions
- 📝 Commit message format
- 🔀 Pull request process
- 🏗️ Architecture deep-dive

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for emotional wellness in the workplace**

*Every card on this wall is a piece of someone's heart, shared in safe silence.*

[⬆ Back to Top](#-confession-wall)

</div>
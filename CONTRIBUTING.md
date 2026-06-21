# 🤝 Contributing to Confession Wall

First off, **thank you** for considering contributing to Confession Wall! 🎉

This project exists because of people like you who want to make workplace emotional wellness better. Whether you're fixing a bug, adding a feature, improving documentation, or just asking questions — every contribution matters.

---

## 📜 Code of Conduct

### Our Pledge

This project is built around empathy and emotional safety. We expect the same from our contributors:

- **Be respectful** — Treat everyone with kindness and understanding
- **Be inclusive** — Welcome people of all backgrounds and experience levels
- **Be constructive** — Give helpful feedback, not harsh criticism
- **Be patient** — Not everyone has the same level of experience
- **Focus on what's best** — For the community and the project

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## 🍴 How to Contribute

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then:
git clone https://github.com/YOUR_USERNAME/confession-wall.git
cd confession-wall
```

### 2. Set Up Development Environment

Follow the [Quick Start guide in README.md](./README.md#-quick-start) to:

1. Install dependencies (`npm install`)
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Run the database migrations
4. Start the dev server (`npm run dev`)

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 4. Make Your Changes

Write clean, readable code. Follow the existing patterns in the codebase.

### 5. Test Your Changes

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (make sure it compiles)
npm run build
```

### 6. Commit and Push

```bash
git add .
git commit -m "feat: add amazing feature"
git push origin feature/your-feature-name
```

### 7. Open a Pull Request

Go to the original repository on GitHub and click **"Compare & pull request"**. Fill out the PR template describing your changes.

---

## 🌿 Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/dark-mode` |
| Bug Fix | `fix/description` | `fix/like-count-sync` |
| Documentation | `docs/description` | `docs/api-reference` |
| Refactor | `refactor/description` | `refactor/auth-context` |
| Chore | `chore/description` | `chore/update-dependencies` |

---

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, etc. |

### Examples

```
feat(confession): add image attachment support
fix(likes): resolve optimistic update race condition
docs(api): update endpoint documentation
refactor(auth): simplify admin check flow
chore(deps): update Next.js to latest patch version
```

---

## 🔀 Pull Request Process

1. **Update documentation** if your change affects public APIs or user-facing features
2. **Add screenshots** for UI changes (include before/after if applicable)
3. **Keep PRs small** — Focus on one feature or fix per PR
4. **Write clear descriptions** — Explain what, why, and how
5. **Link related issues** — Use `Fixes #123` or `Closes #456`
6. **Ensure all checks pass** — Type check, lint, and build must succeed

### PR Template

```markdown
## 📝 Description
What does this PR do?

## 🎯 Motivation
Why is this change needed?

## 📋 Changes
- [ ] Change 1
- [ ] Change 2

## 📸 Screenshots (if applicable)
Before/After screenshots

## ✅ Checklist
- [ ] Code compiles (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or documented if there are)
```

---

## 🏗️ Architecture Deep-Dive

### Overall Architecture

```
┌─────────────────────────────────────────────┐
│                   Client                     │
│  (React 19 + Next.js App Router)            │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ The Wall │ │ Confess  │ │ HR Dashboard │ │
│  │ (Home)   │ │ (Write)  │ │ (Admin)      │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │            │              │          │
│  ┌────┴────────────┴──────────────┴───────┐ │
│  │         API Routes (Next.js)            │ │
│  │  /api/confessions  /api/moderate        │ │
│  │  /api/notifications  /api/comments      │ │
│  │  /api/auth  /api/user  /api/cron        │ │
│  └────────────────┬───────────────────────┘ │
└───────────────────┼─────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │     Supabase       │
          │  ┌──────────────┐  │
          │  │  PostgreSQL   │  │
          │  │  (RLS)        │  │
          │  ├──────────────┤  │
          │  │  Auth         │  │
          │  │  (Email/OAuth)│  │
          │  └──────────────┘  │
          └────────────────────┘
```

### Key Design Decisions

#### 1. **Server-Side API Routes as Bouncer**
All database operations go through Next.js API routes, never directly from the client. This allows:
- Input validation & profanity filtering on the server
- Using `SUPABASE_SERVICE_ROLE_KEY` only server-side (bypasses RLS for admin ops)
- Using `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client reads (respects RLS)

#### 2. **Row Level Security (RLS)**
Supabase RLS policies enforce data access at the database level:
- Even if someone accesses Supabase directly, they can only see what RLS allows
- Admin operations use `service_role` key to bypass RLS
- Client operations use `anon` key and respect RLS

#### 3. **Optimistic UI Updates**
The like system uses optimistic updates for instant feedback:
1. UI updates immediately (like count +1, heart fills)
2. Server request is sent
3. On success: server count becomes source of truth
4. On failure: UI reverts to previous state

#### 4. **Form State with `useReducer`**
`useConfessionForm` hook uses React's `useReducer` for complex form state:
- Multiple interdependent fields
- Draft auto-save to localStorage
- Validation logic
- Status tracking (idle → submitting → success/error)

#### 5. **Two-Key Supabase Strategy**
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — Used in client components (respects RLS)
- **`SUPABASE_SERVICE_ROLE_KEY`** — Used ONLY in API routes (bypasses RLS for admin)

### Component Architecture

```
AuthProvider (Context)
├── Header
│   ├── Navigation
│   ├── NotificationBell → NotificationModal
│   ├── AvatarDropdown (user confessions)
│   └── MobileDrawer
├── Page: Home (The Wall)
│   ├── MasonryGrid
│   │   └── WallCard[] (like, comment trigger)
│   ├── CommentModal
│   └── FloatingActionButton
├── Page: Confess
│   ├── ConfessionForm (useConfessionForm reducer)
│   └── ConfessionPreview
└── Page: Dashboard (Admin)
    ├── MetricCards
    ├── TabNavigation
    ├── DataTable / MobileCards
    ├── HRReplyModal
    └── Pagination
```

### Data Flow

#### Submitting a Confession
```
User types → useConfessionForm (state) → localStorage (draft auto-save)
     ↓ (submit)
POST /api/confessions → validate + profanity check → insert with status=pending
     ↓ (success)
Clear draft → show success state → redirect or stay
```

#### HR Moderation Flow
```
Dashboard mount → check admin (GET /api/auth/check-admin)
     ↓ (admin)
Fetch pending + filtered tabs → render table/cards
     ↓ (action)
POST /api/moderate → update status → refresh data
     ↓ (HR reply)
POST /api/confessions/[id]/hr-reply → insert hr_replies + create notification
     ↓
User sees notification → NotificationModal shows reply
```

---

## 🎨 Coding Standards

### TypeScript

- **Strict mode** — Enable all strict checks
- **No `any`** — Use proper types or `unknown` with type guards
- **Interfaces over types** — For object shapes, prefer `interface`
- **Named exports** — Prefer named exports over default exports (except pages)

### React

- **Functional components only** — No class components
- **Hooks rules** — Follow the rules of hooks strictly
- **`useReducer` for complex state** — Simple state can use `useState`
- **Custom hooks** — Extract reusable logic into `src/hooks/`
- **Client components** — Mark with `"use client"` only when needed (event handlers, hooks, browser APIs)

### Tailwind CSS

- **Utility-first** — Use Tailwind utilities, avoid custom CSS
- **Design tokens** — Use the project's custom tokens (`text-on-surface`, `bg-primary`, etc.)
- **Responsive** — Mobile-first: write base styles, then `md:` for desktop
- **No `@apply`** — Prefer composing utilities directly in JSX

### API Routes

- **Validate input** — Always validate and sanitize request body
- **Proper HTTP status codes** — 200, 201, 400, 401, 404, 500
- **Consistent response format** — `{ data, error, count }` for lists, `{ data, success }` for mutations
- **Error handling** — Wrap in try/catch, return meaningful error messages

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `WallCard.tsx` |
| Hooks | camelCase with `use` prefix | `useConfessionForm.ts` |
| Utilities | camelCase | `profanity-filter.ts` |
| API Routes | kebab-case dirs | `/api/confessions/[id]/hr-reply/` |
| Pages | `page.tsx` | Next.js App Router convention |

---

## 🗄️ Database Changes

### Running Migrations

1. Write your SQL migration file in `supabase/` directory
2. Name it descriptively: `add_tags_table.sql`, `fix_comment_index.sql`
3. Run it in your Supabase SQL Editor
4. Commit the SQL file to the repository

### Migration File Template

```sql
-- Migration: [Description of what this does]
-- Author: [Your name]
-- Date: [YYYY-MM-DD]

-- Write your SQL here
-- Always include RLS policies for new tables
-- Add indexes for frequently queried columns
```

### RLS Policy Checklist

For every new table, ensure you:
- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- [ ] Create a SELECT policy (who can read?)
- [ ] Create an INSERT policy (who can create?)
- [ ] Create an UPDATE policy (who can modify?)
- [ ] Create a DELETE policy (who can remove?)
- [ ] Add indexes for foreign keys and frequently filtered columns

---

## 👨‍💼 Setting Up Admin Access

To test HR Dashboard features during development:

1. **Sign up** a new user through the app
2. The `profiles` table auto-populates via Supabase Auth trigger (or manually insert)
3. **Set as admin** in Supabase SQL Editor:

```sql
-- Find your user
SELECT * FROM profiles;

-- Set as admin
UPDATE profiles SET is_admin = true WHERE id = 'your-user-uuid';
```

4. Refresh the app — you should now see **Dashboard** in the navigation

---

## ❓ Questions?

- **Bug reports** — [Open an issue](https://github.com/nuuwbiie/confession-wall/issues/new)
- **Feature requests** — [Open an issue](https://github.com/nuuwbiie/confession-wall/issues/new) with the `enhancement` label
- **Questions** — [Start a discussion](https://github.com/nuuwbiie/confession-wall/discussions)

---

## 🙏 Recognition

All contributors will be recognized! Whether it's your first PR or your hundredth, your effort matters.

Thank you for helping make workplaces a little more human. 💚

---

<div align="center">

*Confession Wall — Because every heart deserves to be heard.*

[⬆ Back to Top](#-contributing-to-confession-wall)

</div>
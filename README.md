# Smart Bookmark App

A production-ready private bookmark manager built with Next.js 14, Supabase, and Tailwind CSS. Features Google OAuth, real-time sync across devices, and strict per-user privacy via Row Level Security.

## Features

- **Google OAuth** - Sign in with Google only
- **Add Bookmarks** - URL + Title with validation (duplicate prevention, URL normalization)
- **Delete Bookmarks** - With confirmation, RLS-protected
- **Real-Time Sync** - Instant updates across tabs and devices via Supabase Realtime
- **Private by Design** - Row Level Security ensures User A never sees User B's data
- **Clean UI** - Loading states, empty state, toasts, Tailwind CSS

## Tech Stack

- Next.js 14+ (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- TypeScript (strict mode)

## Project Structure

```
smartBookMarkApp/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx              # Main app (bookmarks list, add form)
│   ├── login/
│   │   └── page.tsx              # Google sign-in page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Root redirect
├── components/
│   ├── AddBookmarkForm.tsx       # Add bookmark form with validation
│   ├── BookmarkItem.tsx          # Single bookmark with delete
│   ├── BookmarkList.tsx          # List + Realtime subscription
│   └── Toast.tsx                 # Toast notifications
├── hooks/
│   └── useToast.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── middleware.ts         # Session refresh
│   │   └── server.ts             # Server client
│   ├── types.ts
│   └── utils.ts                  # URL validation, normalization
├── supabase/
│   └── schema.sql                # Table + RLS policies
├── middleware.ts                 # Auth protection
├── DEPLOYMENT.md                 # Full setup guide
└── package.json
```

## Quick Start

1. **Clone and install**
   ```bash
   cd smartBookMarkApp
   npm install
   ```

2. **Setup Supabase**  
   Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for:
   - Supabase project
   - Google OAuth
   - Database schema

3. **Environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase URL and anon key
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deployment Checklist

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete checklist. Summary:

- [ ] Supabase project + Google OAuth
- [ ] Database schema + RLS + Realtime
- [ ] Redirect URLs (localhost + Vercel)
- [ ] Env vars in Vercel
- [ ] Deploy

## License

MIT

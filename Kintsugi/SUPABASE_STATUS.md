# Supabase Migration - Current Status

## ✅ Phase 1 & 2A Complete

### What's Been Done

#### 1. Supabase Setup ✅
- Installed `@supabase/supabase-js` and `@supabase/ssr`
- Created client configurations for server and browser
- Set up environment variables

#### 2. Database Migration ✅
- Complete SQL migration script in `supabase/migration.sql`
- All tables created with proper relationships
- Row Level Security (RLS) policies configured
- Default pricing plans seeded
- Indexes for performance

#### 3. Authentication System ✅
- Replaced Better Auth with Supabase Auth
- Created auth helper functions
- Implemented middleware for session refresh
- New auth API routes:
  - `POST /api/supabase-auth/signin`
  - `POST /api/supabase-auth/signup`
  - `POST /api/supabase-auth/signout`
  - `GET /api/supabase-auth/session`

#### 4. Sample API Migration ✅
- Migrated pricing API to Supabase
- Example at `/api/pricing-supabase/route.ts`

## 🔄 What's Next (Phases 2B-4)

### Phase 2B: Migrate Remaining APIs
The following API routes need to be migrated from Drizzle to Supabase:

**Events APIs:**
- `/api/events/list` - List events with filters
- `/api/events/create` - Create new event
- `/api/events/[id]` - Get/update/delete event
- `/api/manager/events` - Manager's events

**Organizations APIs:**
- `/api/organizations` - List/create organizations
- `/api/organizations/[id]` - Manage organization
- `/api/organizations/[id]/members` - Manage members

**Teams APIs:**
- `/api/teams` - List/create teams
- `/api/teams/[id]` - Manage team
- `/api/teams/members` - Manage team members

**Registrations APIs:**
- `/api/registrations` - Event registrations
- `/api/user/registrations` - User's registrations

**Other APIs:**
- `/api/stats` - Dashboard statistics
- `/api/manager-applications/admin` - Manager applications
- `/api/user` - User profile

### Phase 3: Frontend Updates
**Auth Client:**
- Replace `@/lib/auth-client` usage with Supabase client
- Update login/signup forms
- Update session checking

**Pages to Update:**
- `/app/auth/page.tsx` - Login/signup page
- `/app/dashboard/page.tsx` - Use Supabase auth
- All pages using `useSession()`

**Navigation:**
- Complete side navigation component
- Make it responsive
- Add proper menu items

**Home Page:**
- Fill in fragments
- Add hero section
- Add features section
- Add CTA sections

### Phase 4: Android App
**Setup:**
- Add Supabase client library
- Configure Supabase credentials

**Auth:**
- Implement Supabase Auth
- Sign in/sign up flows
- Session management

**APIs:**
- Replace all API calls with Supabase queries
- Use Supabase Realtime for live updates

## Migration Strategy

### Approach: Parallel Migration
Instead of replacing all at once, we're creating new Supabase versions alongside existing ones:

1. Old Better Auth endpoints remain at `/api/auth/[...all]`
2. New Supabase Auth at `/api/supabase-auth/*`
3. Old Drizzle APIs at `/api/pricing`
4. New Supabase APIs at `/api/pricing-supabase`

### Benefits:
- No breaking changes during development
- Can test new endpoints before switching
- Easy rollback if needed
- Gradual migration path

### Next Steps:
1. Migrate 2-3 key API routes (events, organizations)
2. Update frontend to use new auth
3. Test authentication flow
4. Migrate remaining APIs
5. Update Android app
6. Complete navigation and home page
7. Remove old Drizzle/Better Auth code

## How to Apply This Work

### 1. Run Migration in Supabase
```sql
-- Go to Supabase Dashboard → SQL Editor
-- Copy and run: supabase/migration.sql
```

### 2. Update Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://uismdijzbczptlhonmmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Test New Auth Endpoints
```bash
# Sign up
curl -X POST http://localhost:3000/api/supabase-auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign in
curl -X POST http://localhost:3000/api/supabase-auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get session
curl http://localhost:3000/api/supabase-auth/session
```

### 4. Test Pricing API
```bash
curl http://localhost:3000/api/pricing-supabase
```

## Files Structure

```
Kintsugi/eventsync-web/eventsync/
├── lib/
│   └── supabase/
│       ├── client.ts          # Basic client
│       ├── server.ts          # Server-side client
│       ├── browser.ts         # Browser client
│       └── auth.ts            # Auth helpers
├── app/
│   └── api/
│       ├── supabase-auth/     # New auth endpoints
│       │   ├── signin/
│       │   ├── signup/
│       │   ├── signout/
│       │   └── session/
│       └── pricing-supabase/  # Example migrated API
├── middleware.ts              # Auth session refresh
└── supabase/
    └── migration.sql          # Database schema

Documentation:
├── Kintsugi/
│   ├── SUPABASE_MIGRATION.md       # Migration guide
│   └── SUPABASE_STATUS.md          # This file
```

## Estimated Remaining Work

- **Phase 2B** (API Migration): 4-6 hours
- **Phase 3** (Frontend): 3-4 hours  
- **Phase 4** (Android): 4-6 hours
- **Testing & Cleanup**: 2-3 hours

**Total Remaining**: ~15-20 hours

## Benefits of This Migration

1. **Simplified Stack**: No need for Better Auth, Drizzle, pg driver
2. **Built-in Features**: Realtime, storage, auth all in one
3. **Better Security**: RLS policies at database level
4. **Easier Deployment**: Managed infrastructure
5. **Cost Effective**: Free tier is generous
6. **Modern DX**: Great documentation and tooling

## Support

If you encounter issues:
1. Check Supabase dashboard for auth/database errors
2. Verify environment variables are set correctly
3. Ensure migration SQL was run successfully
4. Check browser console for client-side errors
5. Check server logs for API errors

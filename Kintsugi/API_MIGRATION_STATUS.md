# API Migration Status

## ⚠️ OLD API ROUTES (Need Migration or Removal)

These routes were built for Drizzle ORM and will not work now that Drizzle has been removed. They need to be migrated to use Supabase client.

### Events APIs
- [ ] `GET /api/events/list` - List events with filters
- [ ] `POST /api/events/create` - Create new event
- [ ] `GET /api/events/[id]` - Get event details
- [ ] `PATCH /api/events/[id]` - Update event
- [ ] `DELETE /api/events/[id]` - Delete event
- [ ] `POST /api/events/[id]/initialize-qrcodes` - Initialize QR codes
- [ ] `GET /api/events/[id]/messages` - Event messages
- [ ] `POST /api/events/[id]/notify-teams` - Notify teams
- [ ] `GET/PUT /api/events/[id]/page` - Event page design
- [ ] `POST /api/events/[id]/team/[teamId]/generate-qrcodes` - Generate team QR codes
- [ ] `GET /api/events/[id]/team/[teamId]/qrcodes` - Get team QR codes
- [ ] `POST /api/events/[id]/verify-qr` - Verify QR code
- [ ] `GET /api/manager/events` - Manager's events

### Organizations APIs
- [ ] `GET/POST /api/organizations` - List/create organizations
- [ ] `GET/PATCH/DELETE /api/organizations/[id]` - Manage organization
- [ ] `POST/PATCH/DELETE /api/organizations/[id]/members` - Manage members

### Teams APIs
- [ ] `GET/POST /api/teams` - List/create teams
- [ ] `GET/PATCH/DELETE /api/teams/[id]` - Manage team
- [ ] `POST/DELETE /api/teams/members` - Manage members

### Registrations APIs
- [ ] `GET/POST /api/registrations` - List/create registrations
- [ ] `GET/PATCH /api/registrations/event/[eventId]/team/[teamId]` - Manage registration
- [ ] `GET /api/manager/registrations` - Manager's registrations
- [ ] `GET /api/user/registrations` - User's registrations

### User APIs
- [ ] `GET/PATCH /api/user` - User profile
- [ ] `GET /api/user/activity` - User activity

### Stats APIs
- [ ] `GET /api/stats` - Dashboard statistics

### Manager Applications APIs
- [ ] `POST /api/manager-applications/submit` - Submit application
- [ ] `GET/PATCH /api/manager-applications/admin` - Admin manage applications

### Old Pricing API
- [ ] `GET /api/pricing` - Old pricing API (needs removal, use /api/pricing-supabase)

## ✅ NEW SUPABASE APIs (Working)

### Authentication
- [x] `POST /api/supabase-auth/signin` - Sign in with email/password
- [x] `POST /api/supabase-auth/signup` - Sign up new user
- [x] `POST /api/supabase-auth/signout` - Sign out
- [x] `GET /api/supabase-auth/session` - Get current session

### Pricing
- [x] `GET /api/pricing-supabase` - Get pricing plans

## 🎯 Priority Migration Order

1. **Auth Integration** (Phase 3)
   - Update frontend to use `/api/supabase-auth/*`
   - Replace auth-client usage throughout app

2. **Essential APIs** (Phase 2C)
   - Events list, create, get, update, delete
   - Organizations CRUD
   - Teams CRUD
   - Registrations

3. **Supporting APIs**
   - Stats (dashboard)
   - Manager applications
   - User profile
   - QR codes

4. **Cleanup**
   - Remove all old API routes
   - Update documentation

## Migration Pattern

Each old API should be:
1. **Analyzed** - Understand what it does
2. **Migrated** - Create new version using Supabase client
3. **Tested** - Verify it works with Supabase
4. **Replaced** - Update frontend to use new endpoint
5. **Removed** - Delete old file once confirmed working

Example migration:
```typescript
// OLD (Drizzle)
import { db, schema } from '@/db'
const events = await db.select().from(schema.event)

// NEW (Supabase)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: events } = await supabase.from('events').select('*')
```

## Notes

- All old routes reference removed `@/db` and `@/lib/auth`
- They will fail to compile/run until migrated
- Middleware handles auth session refresh automatically
- RLS policies in Supabase handle permissions

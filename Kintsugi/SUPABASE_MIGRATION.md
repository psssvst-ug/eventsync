# Supabase Migration Guide

This guide explains how to migrate the EventSync application to use Supabase.

## Step 1: Set Up Supabase Project

1. Go to https://supabase.com and create a new project (or use existing)
2. Note your project credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Update Environment Variables

Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uismdijzbczptlhonmmz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc21kaWp6YmN6cHRsaG9ubW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDY5ODUsImV4cCI6MjA3OTMyMjk4NX0.iiucqJYgrsiCwtzyElkJo39uSUUczzq-Yf05IGlhLhY
```

## Step 3: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migration.sql`
4. Paste and run in the SQL Editor

This will create:
- All necessary tables
- Row Level Security policies
- Indexes for performance
- Default pricing plans

## Step 4: Install Dependencies

Dependencies are already installed:
- `@supabase/supabase-js` - Main Supabase client
- `@supabase/ssr` - Server-side rendering support

## Step 5: Migration Status

### ✅ Completed
- Supabase client configuration (server, browser, client)
- Database schema migration SQL
- Environment variables documentation

### 🔄 In Progress
- API routes migration (replacing Drizzle with Supabase)
- Auth system (replacing Better Auth with Supabase Auth)
- Frontend updates (using Supabase client)

### 📋 Pending
- Android app Supabase integration
- Navigation redesign
- Home page completion

## Architecture Changes

### Before (Drizzle ORM + Better Auth)
```
Next.js App → Better Auth → Drizzle ORM → PostgreSQL
```

### After (Supabase)
```
Next.js App → Supabase Client → Supabase (PostgreSQL + Auth)
```

## Benefits of Supabase Migration

1. **Unified Platform**: Auth, database, and storage in one place
2. **Real-time Capabilities**: Built-in realtime subscriptions
3. **Row Level Security**: Database-level security policies
4. **Auto-generated REST APIs**: Direct database access with RLS
5. **Better Scalability**: Managed infrastructure
6. **Simpler Auth**: No need for separate auth library

## Database Schema

The schema includes:
- `user_profiles` - Extended user information
- `teams` - Team management
- `team_members` - Team membership
- `pricing_plans` - Subscription tiers (Free, Starter, Professional, Enterprise)
- `organizations` - Multi-tenant organizations
- `organization_members` - Organization membership with roles
- `events` - Event management
- `registrations` - Event registrations
- `qr_codes` - QR code tracking
- `manager_applications` - Manager role applications
- `subscriptions` - Subscription tracking
- `attendance_tracking` - Attendance records

## Security

All tables have Row Level Security (RLS) enabled with policies:
- Users can only access their own data
- Organization members can view organization resources
- Admins have elevated permissions
- Public events are visible to all

## Next Steps

1. Run the migration SQL in Supabase
2. Verify tables are created
3. Test Supabase connection
4. Continue with API migration

## Troubleshooting

### Tables not created
- Check SQL Editor for errors
- Ensure UUID extension is enabled
- Verify foreign key references

### Authentication issues
- Confirm environment variables are set
- Check Supabase project settings
- Verify auth policies

### Connection errors
- Double-check SUPABASE_URL and ANON_KEY
- Ensure they're prefixed with `NEXT_PUBLIC_`
- Restart development server after changing env vars

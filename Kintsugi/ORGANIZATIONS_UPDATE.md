# EventSync - Organizations & Pricing Update

## Overview

This document describes the major restructure of EventSync to support Organizations, Pricing Tiers, and improved permission management.

## What Changed

### 1. Organizations System

Previously, events were created by individual managers. Now:
- **Organizations** are the primary entity
- Each organization has **admins** and **event managers**
- Events belong to organizations, not individuals
- Better permission management and team collaboration

### 2. Pricing & Subscription System

Four pricing tiers with different limits:

| Plan | Price | Events/Month | Managers | Attendees/Event |
|------|-------|--------------|----------|----------------|
| **Free** | $0 | 1 | 1 | 50 |
| **Starter** | $29 | 5 | 3 | 200 |
| **Professional** | $99 | 20 | 10 | 1,000 |
| **Enterprise** | $299 | Unlimited | Unlimited | Unlimited |

All plans include a **14-day free trial**.

### 3. New Permission Model

**System Admin (role: admin)**
- Full access to everything
- Can manage any organization or event
- Approve/reject manager applications

**Organization Admin**
- Create and manage their organizations
- Add/remove event managers
- Create and manage events
- Update organization settings

**Organization Manager (Event Manager)**
- Create and manage events within their organization
- Cannot add/remove other managers
- Limited to organization's plan limits

**User**
- Register for events
- Create and join teams
- Apply to become a manager

## Database Schema Changes

### New Tables

1. **pricing_plan** - Defines subscription tiers
   - Features, limits, pricing
   - Active/inactive status

2. **organization** - Main organization entity
   - Links to pricing plan
   - Subscription status (trial, active, suspended, cancelled)
   - Contact information

3. **organization_member** - Links users to organizations
   - Role (admin, manager)
   - Status (active, inactive, invited)
   - Join date

4. **subscription** - Tracks subscription details
   - Payment history
   - Auto-renewal settings

### Updated Tables

**event** - Now includes:
- `organizationId` (required) - Links event to organization
- `registrationFee` - Event registration cost
- `currency` - Currency for fees

## API Changes

### New Endpoints

#### Organizations
- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/:id` - Get organization details
- `PATCH /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

#### Organization Members
- `POST /api/organizations/:id/members` - Add member
- `DELETE /api/organizations/:id/members?userId=xxx` - Remove member
- `PATCH /api/organizations/:id/members` - Update member role

#### Pricing
- `GET /api/pricing` - List all pricing plans

### Updated Endpoints

#### Events
- `POST /api/events/create` - Now requires `organizationId`
- `PATCH /api/events/:id` - Checks organization permissions
- `DELETE /api/events/:id` - Checks organization permissions

## Frontend Pages

### New Pages

1. **/organizations** - List all user's organizations
   - Shows role, subscription status
   - Links to manage each organization

2. **/organizations/create** - Create new organization
   - Organization details form
   - Pricing plan selection
   - Starts with 14-day trial

3. **/pricing** - Display pricing plans
   - Feature comparison
   - Direct links to create organization

### Page Flow

```
User Login
    ↓
Dashboard
    ↓
Organizations Page (view all orgs)
    ↓
Create Organization → Select Pricing Plan
    ↓
Organization Dashboard
    ↓
Create Event (within organization)
```

## Setup Instructions

### 1. Database Migration

The new schema needs to be applied to your database:

```bash
cd Kintsugi/eventsync-web/eventsync
npm run db:push  # or your migration command
```

### 2. Seed Pricing Plans

Run the seed script to populate default pricing plans:

```bash
cd Kintsugi/eventsync-web/eventsync
npx ts-node scripts/seed-pricing-plans.ts
```

This creates the 4 default pricing plans (Free, Starter, Professional, Enterprise).

### 3. Update Environment Variables

Ensure your `.env` file has:
```
DATABASE_URL="your-postgresql-connection-string"
BETTER_AUTH_URL="your-auth-url"
```

### 4. Install Dependencies

```bash
cd Kintsugi/eventsync-web/eventsync
npm install
```

### 5. Build and Run

```bash
npm run build
npm run start
```

Or for development:
```bash
npm run dev
```

## Usage Guide

### For System Admins

1. Access admin panel to review manager applications
2. Approve/reject applications to grant manager role
3. Monitor organizations and subscriptions
4. Access all events and organizations

### For Organization Admins

1. Apply to become a manager (if not already)
2. Create an organization via `/organizations/create`
3. Select a pricing plan (starts with free trial)
4. Add event managers to your organization
5. Create events under your organization
6. Monitor subscription and plan limits

### For Event Managers

1. Join an organization (invited by admin)
2. Create events within your organization
3. Manage event registrations and QR codes
4. Stay within organization's plan limits

### For Users

1. Browse events on the events page
2. Register for events with your team
3. Check in using QR codes
4. View your registered events
5. Apply to become a manager if needed

## Plan Limits Enforcement

The system enforces limits at event creation:

- **Events per month**: Checked when creating new event
- **Event managers**: Checked when adding new manager to organization
- **Attendees per event**: Validated against maxCapacity field

When limits are reached, users see clear error messages explaining the limit and suggesting an upgrade.

## Migration Path for Existing Data

If you have existing events without organizations:

1. Create a default organization for each existing manager
2. Assign existing events to those organizations
3. Update foreign keys

Example migration script needed (not included):
```sql
-- Create organizations for existing managers
-- Link existing events to new organizations
-- Set default pricing plan
```

## Android App Integration

The Android app has been updated with:
- Organization model
- API endpoints for fetching organizations
- Ready for UI implementation

To complete Android implementation:
- Add organization selection screen
- Update event creation to require organization
- Display organization info in user profile

## Testing Checklist

- [ ] Create new organization with each pricing tier
- [ ] Verify free trial starts correctly
- [ ] Add manager to organization
- [ ] Create event under organization
- [ ] Test plan limit enforcement
- [ ] Remove manager from organization
- [ ] Update organization details
- [ ] Delete organization (cascades properly)
- [ ] Test permission checks for non-members
- [ ] Verify event creation requires organization

## Known Issues / TODO

1. **Database Migration**: Schema changes need to be applied to production database
2. **Payment Integration**: Payment gateway not yet integrated for subscriptions
3. **Subscription Management**: Auto-renewal and payment tracking not implemented
4. **Email Notifications**: Invite emails for organization members not implemented
5. **Android UI**: Organization selection UI needs to be built
6. **Navigation**: Main navigation needs organization and pricing links

## API Documentation

Detailed API documentation is available in:
`Kintsugi/eventsync-web/eventsync/app/api/README.md`

## Support

For issues or questions:
1. Check this documentation
2. Review API documentation
3. Check database schema
4. Contact development team

## Version History

- **v2.0.0** - Organizations & Pricing System (Current)
- **v1.0.0** - Initial EventSync release

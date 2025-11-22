-- EventSync Organizations & Pricing Migration
-- Run this SQL to add the new tables for organizations and pricing

-- 1. Create Pricing Plan table
CREATE TABLE IF NOT EXISTS "pricing_plan" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "max_events" INTEGER DEFAULT 1,
    "max_event_managers" INTEGER DEFAULT 1,
    "max_attendees_per_event" INTEGER DEFAULT 50,
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create Organization table
CREATE TABLE IF NOT EXISTS "organization" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "address" TEXT,
    "pricing_plan_id" UUID NOT NULL REFERENCES "pricing_plan"("id") ON DELETE RESTRICT,
    "subscription_status" TEXT NOT NULL DEFAULT 'trial',
    "subscription_start_date" TIMESTAMP,
    "subscription_end_date" TIMESTAMP,
    "trial_ends_at" TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Create Organization Member table
CREATE TABLE IF NOT EXISTS "organization_member" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "invited_by" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP DEFAULT NOW(),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "organization_member_org_user_unique" UNIQUE ("organization_id", "user_id")
);

-- 4. Create Subscription table
CREATE TABLE IF NOT EXISTS "subscription" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
    "pricing_plan_id" UUID NOT NULL REFERENCES "pricing_plan"("id") ON DELETE RESTRICT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "payment_method" TEXT,
    "last_payment_date" TIMESTAMP,
    "next_payment_date" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Add new columns to event table
ALTER TABLE "event" 
ADD COLUMN IF NOT EXISTS "organization_id" UUID REFERENCES "organization"("id") ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "registration_fee" DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD';

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_organization_member_org_id" ON "organization_member"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_organization_member_user_id" ON "organization_member"("user_id");
CREATE INDEX IF NOT EXISTS "idx_event_organization_id" ON "event"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_organization_id" ON "subscription"("organization_id");

-- 7. Insert default pricing plans
INSERT INTO "pricing_plan" ("name", "display_name", "description", "price", "currency", "max_events", "max_event_managers", "max_attendees_per_event", "features", "is_active", "sort_order")
VALUES 
    ('free', 'Free', 'Perfect for getting started', 0, 'USD', 1, 1, 50, 
     '["1 event per month", "1 event manager", "Up to 50 attendees per event", "Basic QR code check-in", "Email support"]'::jsonb, 
     true, 0),
    ('starter', 'Starter', 'For small organizations', 29, 'USD', 5, 3, 200,
     '["5 events per month", "3 event managers", "Up to 200 attendees per event", "Advanced QR code features", "Team management", "Custom event pages", "Email & chat support"]'::jsonb,
     true, 1),
    ('professional', 'Professional', 'For growing organizations', 99, 'USD', 20, 10, 1000,
     '["20 events per month", "10 event managers", "Up to 1000 attendees per event", "All Starter features", "Analytics & reporting", "Custom branding", "API access", "Priority support"]'::jsonb,
     true, 2),
    ('enterprise', 'Enterprise', 'For large organizations', 299, 'USD', -1, -1, -1,
     '["Unlimited events", "Unlimited event managers", "Unlimited attendees", "All Professional features", "Dedicated account manager", "Custom integrations", "SLA guarantee", "24/7 phone support", "On-premise deployment option"]'::jsonb,
     true, 3)
ON CONFLICT DO NOTHING;

-- Note: After running this migration, you may need to:
-- 1. Create default organizations for existing managers (if any)
-- 2. Link existing events to organizations
-- 3. Run: UPDATE event SET organization_id = <some_org_id> WHERE organization_id IS NULL;

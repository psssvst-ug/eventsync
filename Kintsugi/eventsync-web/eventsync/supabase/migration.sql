-- EventSync Supabase Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (Supabase Auth handles core user data, this is for additional fields)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Pricing plans
CREATE TABLE IF NOT EXISTS public.pricing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    max_events INTEGER DEFAULT 1,
    max_event_managers INTEGER DEFAULT 1,
    max_attendees_per_event INTEGER DEFAULT 50,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    website TEXT,
    logo TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    address TEXT,
    pricing_plan_id UUID NOT NULL REFERENCES public.pricing_plans(id) ON DELETE RESTRICT,
    subscription_status TEXT DEFAULT 'trial',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    max_capacity INTEGER,
    min_team_size INTEGER DEFAULT 1,
    max_team_size INTEGER DEFAULT 5,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft',
    image_url TEXT,
    page JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Registrations
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(event_id, team_id)
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- QR Codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Manager applications
CREATE TABLE IF NOT EXISTS public.manager_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    website TEXT,
    description TEXT NOT NULL,
    experience TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.manager_applications ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    pricing_plan_id UUID NOT NULL REFERENCES public.pricing_plans(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method TEXT,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Attendance tracking
CREATE TABLE IF NOT EXISTS public.attendance_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    scanned_by UUID NOT NULL REFERENCES auth.users(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    qr_code_id UUID REFERENCES public.qr_codes(id)
);

ALTER TABLE public.attendance_tracking ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_manager_id ON public.events(manager_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team_id ON public.registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, display_name, description, price, currency, max_events, max_event_managers, max_attendees_per_event, features, is_active, sort_order)
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
ON CONFLICT (name) DO NOTHING;

-- RLS Policies

-- User profiles: users can read all, update their own
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Teams: users can read all, create their own, update/delete own teams
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own teams" ON public.teams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own teams" ON public.teams FOR DELETE USING (auth.uid() = created_by);

-- Team members: visible to team members, manageable by team creator
CREATE POLICY "Team members can view their teams" ON public.team_members FOR SELECT USING (
    user_id = auth.uid() OR 
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);
CREATE POLICY "Team creators can manage members" ON public.team_members FOR ALL USING (
    team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Pricing plans: readable by all
CREATE POLICY "Anyone can view pricing plans" ON public.pricing_plans FOR SELECT USING (is_active = true);

-- Organizations: members can view, admins can manage
CREATE POLICY "Organization members can view" ON public.organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);
CREATE POLICY "Organization admins can update" ON public.organizations FOR UPDATE USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Events: public can view published, managers/admins can manage
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (
    status = 'published' OR 
    manager_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);
CREATE POLICY "Managers can create events" ON public.events FOR INSERT WITH CHECK (
    manager_id = auth.uid() AND
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);
CREATE POLICY "Managers can update their events" ON public.events FOR UPDATE USING (
    manager_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Managers can delete their events" ON public.events FOR DELETE USING (
    manager_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Enable realtime for key tables (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;

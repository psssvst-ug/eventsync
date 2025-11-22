import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/orgs-supabase
 * List user's organizations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get organizations where user is a member
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)

    if (membershipsError) {
      return NextResponse.json(
        { success: false, error: membershipsError.message },
        { status: 500 }
      )
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No organizations found'
      })
    }

    const orgIds = memberships.map(m => m.organization_id)

    // Get organization details
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select(`
        *,
        pricing_plans (
          name,
          display_name,
          price,
          max_events,
          max_event_managers,
          max_attendees_per_event
        )
      `)
      .in('id', orgIds)

    if (orgsError) {
      return NextResponse.json(
        { success: false, error: orgsError.message },
        { status: 500 }
      )
    }

    // Add role to each organization
    const orgsWithRoles = organizations?.map(org => {
      const membership = memberships.find(m => m.organization_id === org.id)
      return {
        ...org,
        userRole: membership?.role || 'member'
      }
    })

    return NextResponse.json({
      success: true,
      data: orgsWithRoles || [],
      message: 'Organizations fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orgs-supabase
 * Create new organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      website,
      contact_email,
      contact_phone,
      address,
      pricing_plan_id
    } = body

    // Validate required fields
    if (!name || !type || !contact_email || !pricing_plan_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        description,
        type,
        website,
        contact_email,
        contact_phone,
        address,
        pricing_plan_id,
        subscription_status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        is_active: true
      })
      .select()
      .single()

    if (orgError) {
      return NextResponse.json(
        { success: false, error: orgError.message },
        { status: 500 }
      )
    }

    // Add creator as admin
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: 'admin',
        status: 'active'
      })

    if (memberError) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', organization.id)
      
      return NextResponse.json(
        { success: false, error: 'Failed to add admin membership' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}

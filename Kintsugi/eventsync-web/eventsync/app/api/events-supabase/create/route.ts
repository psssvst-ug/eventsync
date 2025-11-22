import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/events-supabase/create
 * Create a new event
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
      title,
      description,
      organization_id,
      start_date,
      end_date,
      location,
      max_capacity,
      min_team_size,
      max_team_size,
      registration_deadline,
      registration_fee,
      status,
      image_url
    } = body

    // Validate required fields
    if (!title || !organization_id || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, organization_id, start_date' },
        { status: 400 }
      )
    }

    // Check if user is member of the organization
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json(
        { success: false, error: 'You are not a member of this organization' },
        { status: 403 }
      )
    }

    // Check if user has permission (admin or manager)
    if (!['admin', 'manager'].includes(membership.role)) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to create events' },
        { status: 403 }
      )
    }

    // Get organization and pricing plan to check limits
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        pricing_plans (
          max_events,
          max_attendees_per_event
        )
      `)
      .eq('id', organization_id)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check monthly event limit (if not unlimited)
    if (org.pricing_plans.max_events > 0) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count, error: countError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization_id)
        .gte('created_at', startOfMonth.toISOString())

      if (countError) {
        return NextResponse.json(
          { success: false, error: 'Failed to check event limit' },
          { status: 500 }
        )
      }

      if (count && count >= org.pricing_plans.max_events) {
        return NextResponse.json(
          { success: false, error: `Monthly event limit (${org.pricing_plans.max_events}) reached for your plan` },
          { status: 403 }
        )
      }
    }

    // Check capacity limit (if not unlimited)
    if (org.pricing_plans.max_attendees_per_event > 0) {
      if (max_capacity && max_capacity > org.pricing_plans.max_attendees_per_event) {
        return NextResponse.json(
          { success: false, error: `Event capacity exceeds plan limit of ${org.pricing_plans.max_attendees_per_event}` },
          { status: 403 }
        )
      }
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        organization_id,
        manager_id: user.id,
        start_date,
        end_date,
        location,
        max_capacity,
        min_team_size: min_team_size || 1,
        max_team_size: max_team_size || 5,
        registration_deadline,
        registration_fee: registration_fee || 0,
        status: status || 'draft',
        image_url
      })
      .select()
      .single()

    if (eventError) {
      return NextResponse.json(
        { success: false, error: eventError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

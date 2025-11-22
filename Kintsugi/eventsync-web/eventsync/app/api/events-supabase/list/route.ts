import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/events-supabase/list
 * List events with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const upcoming = searchParams.get('upcoming') === 'true'
    const sortBy = searchParams.get('sortBy') || 'start_date'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query
    let query = supabase
      .from('events')
      .select('*, organizations(name), user_profiles!events_manager_id_fkey(name)', { count: 'exact' })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    } else {
      // If no status filter, show published events by default for public view
      query = query.eq('status', 'published')
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (upcoming) {
      query = query.gte('start_date', new Date().toISOString())
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    query = query.range(from, to)

    const { data: events, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: events || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      message: 'Events fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

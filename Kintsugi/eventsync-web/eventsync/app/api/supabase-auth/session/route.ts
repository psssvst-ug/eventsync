import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return NextResponse.json({
        success: false,
        user: null,
        session: null
      })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, role')
      .eq('id', session.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: profile?.name || '',
        role: profile?.role || 'user'
      },
      session
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      user: null,
      session: null
    })
  }
}

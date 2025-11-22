import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          name,
          role: 'user'
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: 'Account created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred during sign up' },
      { status: 500 }
    )
  }
}

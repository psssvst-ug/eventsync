import { createClient } from './server'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'manager' | 'admin'
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    name: profile.name,
    role: profile.role
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUp(email: string, password: string, name: string) {
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
    throw new Error(error.message)
  }

  // Create user profile
  if (data.user) {
    await supabase.from('user_profiles').insert({
      id: data.user.id,
      name,
      role: 'user'
    })
  }

  return data
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }

  return session
}

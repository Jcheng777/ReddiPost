import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { redditAPI } from '@/lib/reddit-api'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    if (!user_id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('saved_subreddits')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching saved subreddits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved subreddits' },
      { status: 500 }
    )
  }
}
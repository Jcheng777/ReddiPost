import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { redditAPI } from '@/lib/reddit-api'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      subreddit_name, 
      subreddit_display_name, 
      subreddit_icon_url,
      subreddit_description,
      subscriber_count 
    } = body

    if (!subreddit_name || !subreddit_display_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    if (!user_id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('saved_subreddits')
      .insert({
        user_id,
        subreddit_name,
        subreddit_display_name,
        subreddit_icon_url,
        subreddit_description,
        subscriber_count
      })
      .select()
      .single()

    if (error) {
      // Handle duplicate entry
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Subreddit already saved' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error saving subreddit:', error)
    return NextResponse.json(
      { error: 'Failed to save subreddit' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subreddit_name = searchParams.get('subreddit_name')

    if (!subreddit_name) {
      return NextResponse.json({ error: 'Missing subreddit_name' }, { status: 400 })
    }

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    if (!user_id) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    const { error } = await supabase
      .from('saved_subreddits')
      .delete()
      .eq('user_id', user_id)
      .eq('subreddit_name', subreddit_name)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting saved subreddit:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved subreddit' },
      { status: 500 }
    )
  }
}
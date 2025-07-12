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

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    const body = await request.json()
    const { 
      title,
      body: postBody,
      tldr,
      subreddit_name,
      subreddit_display_name,
      tone,
      status = 'draft',
      reddit_post_id,
      reddit_post_url,
      submitted_at
    } = body

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id,
        title,
        body: postBody,
        tldr,
        subreddit_name,
        subreddit_display_name,
        tone,
        status,
        reddit_post_id,
        reddit_post_url,
        submitted_at
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error saving post:', error)
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // optional filter by status

    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
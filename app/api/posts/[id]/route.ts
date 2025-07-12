import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { redditAPI } from '@/lib/reddit-api'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    // First verify the post belongs to the user
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user_id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Reddit user info
    const redditUser = await redditAPI.getUser()
    const user_id = redditUser.name

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user_id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
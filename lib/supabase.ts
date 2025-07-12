import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Database types
export interface SavedSubreddit {
  id: string
  user_id: string
  subreddit_name: string
  subreddit_display_name: string
  subreddit_icon_url?: string
  subreddit_description?: string
  subscriber_count?: number
  created_at: string
}

export interface Collection {
  id: string
  user_reddit_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface SubredditCollection {
  id: string
  collection_id: string
  subreddit_id: string
  created_at: string
}
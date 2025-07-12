"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, PenTool, FolderOpen, TrendingUp, Plus, Bookmark, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Post } from "@/lib/supabase"

export default function DashboardPage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [savedSubredditsCount, setSavedSubredditsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch recent posts
      const postsResponse = await fetch('/api/posts?limit=5')
      if (postsResponse.ok) {
        const { data } = await postsResponse.json()
        setRecentPosts(data)
      }

      // Fetch saved subreddits count
      const subredditsResponse = await fetch('/api/subreddits/saved')
      if (subredditsResponse.ok) {
        const { data } = await subredditsResponse.json()
        setSavedSubredditsCount(data.length)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const totalPosts = recentPosts.length
  const draftPosts = recentPosts.filter(p => p.status === 'draft').length
  const publishedPosts = recentPosts.filter(p => p.status === 'published')
  const avgUpvotes = publishedPosts.length > 0 
    ? Math.round(publishedPosts.reduce((sum, p) => sum + p.upvotes, 0) / publishedPosts.length)
    : 0

  const stats = [
    {
      title: "Saved Subreddits",
      value: savedSubredditsCount.toString(),
      description: "Communities in your collections",
      icon: Bookmark,
    },
    {
      title: "Total Posts",
      value: totalPosts.toString(),
      description: "Posts created this month",
      icon: PenTool,
    },
    {
      title: "Drafts",
      value: draftPosts.toString(),
      description: "Posts waiting to be published",
      icon: FolderOpen,
    },
    {
      title: "Avg. Engagement",
      value: avgUpvotes.toString(),
      description: "Average upvotes per post",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your Reddit posting activity.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/discover">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Discover
            </Button>
          </Link>
          <Link href="/dashboard/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Your latest Reddit posts and drafts</CardDescription>
            </div>
            <Link href="/dashboard/drafts">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading posts...
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Link href="/dashboard/create">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {post.subreddit_display_name}
                      </Badge>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {post.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.status === "scheduled" && post.scheduled_for 
                          ? `Scheduled for ${formatRelativeTime(post.scheduled_for)}` 
                          : formatRelativeTime(post.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === "published" && (
                      <>
                        <div className="text-right">
                          <div className="text-sm font-medium">{post.upvotes} upvotes</div>
                        </div>
                        {post.reddit_post_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(post.reddit_post_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/discover">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Search className="h-4 w-4 mr-2" />
                Discover New Subreddits
              </Button>
            </Link>
            <Link href="/dashboard/create">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <PenTool className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
            </Link>
            <Link href="/dashboard/drafts">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FolderOpen className="h-4 w-4 mr-2" />
                View Drafts
              </Button>
            </Link>
            <Link href="/dashboard/saved">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Bookmark className="h-4 w-4 mr-2" />
                View Saved Subreddits
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips & Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-medium">Best posting time</p>
                <p className="text-muted-foreground">Tuesday-Thursday, 9-11 AM EST</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-medium">Top performing subreddit</p>
                <p className="text-muted-foreground">r/SideProject (avg. 23 upvotes)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

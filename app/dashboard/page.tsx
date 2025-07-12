"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, PenTool, FolderOpen, TrendingUp, Plus, Bookmark } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Mock data - in a real app, this would come from your database
  const recentPosts = [
    {
      id: 1,
      title: "I built a tool to help entrepreneurs find the perfect subreddits",
      subreddit: "r/SideProject",
      status: "published",
      createdAt: "2 hours ago",
      upvotes: 24,
    },
    {
      id: 2,
      title: "[Feedback Request] Would this solve your problem?",
      subreddit: "r/startups",
      status: "draft",
      createdAt: "1 day ago",
      upvotes: 0,
    },
    {
      id: 3,
      title: "Has anyone found a good solution for Reddit marketing?",
      subreddit: "r/Entrepreneur",
      status: "scheduled",
      createdAt: "3 days ago",
      scheduledFor: "Tomorrow 9:00 AM",
    },
  ]

  const stats = [
    {
      title: "Saved Subreddits",
      value: "12",
      description: "Communities in your collections",
      icon: Bookmark,
    },
    {
      title: "Total Posts",
      value: "8",
      description: "Posts created this month",
      icon: PenTool,
    },
    {
      title: "Drafts",
      value: "3",
      description: "Posts waiting to be published",
      icon: FolderOpen,
    },
    {
      title: "Avg. Engagement",
      value: "18.5",
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
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{post.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {post.subreddit}
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
                      {post.status === "scheduled" ? `Scheduled for ${post.scheduledFor}` : post.createdAt}
                    </span>
                  </div>
                </div>
                {post.status === "published" && (
                  <div className="text-right">
                    <div className="text-sm font-medium">{post.upvotes} upvotes</div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, BookmarkCheck, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import type { SavedSubreddit } from "@/lib/supabase"

export default function SavedSubredditsPage() {
  const [savedSubreddits, setSavedSubreddits] = useState<SavedSubreddit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingSubreddit, setDeletingSubreddit] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedSubreddits()
  }, [])

  const fetchSavedSubreddits = async () => {
    try {
      const response = await fetch('/api/subreddits/saved')
      if (response.ok) {
        const { data } = await response.json()
        setSavedSubreddits(data)
      }
    } catch (error) {
      console.error('Error fetching saved subreddits:', error)
      toast({
        title: "Error",
        description: "Failed to load saved subreddits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSubreddit = async (subreddit: SavedSubreddit) => {
    setDeletingSubreddit(subreddit.subreddit_name)
    
    try {
      const response = await fetch(`/api/subreddits/save?subreddit_name=${encodeURIComponent(subreddit.subreddit_name)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedSubreddits(savedSubreddits.filter(s => s.id !== subreddit.id))
        toast({
          title: "Subreddit removed",
          description: `${subreddit.subreddit_display_name} has been removed from your saved subreddits`,
        })
      } else {
        throw new Error('Failed to remove subreddit')
      }
    } catch (error) {
      console.error('Error removing subreddit:', error)
      toast({
        title: "Error",
        description: "Failed to remove subreddit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingSubreddit(null)
    }
  }

  // Filter subreddits based on search
  const filteredSubreddits = savedSubreddits.filter((subreddit) => {
    const matchesSearch =
      searchQuery === "" ||
      subreddit.subreddit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subreddit.subreddit_display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subreddit.subreddit_description && subreddit.subreddit_description.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Saved Subreddits</h1>
        <p className="text-muted-foreground">Manage your collection of saved subreddits</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search saved subreddits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSubreddits.length} saved subreddit{filteredSubreddits.length !== 1 ? "s" : ""}
        </p>
        {savedSubreddits.length > 0 && (
          <Link href="/dashboard/discover">
            <Button variant="outline" size="sm">
              Discover More
            </Button>
          </Link>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading saved subreddits...</p>
        </div>
      )}

      {/* Subreddit Grid */}
      {!loading && filteredSubreddits.length > 0 && (
        <div className="grid gap-4">
          {filteredSubreddits.map((subreddit) => (
            <Card key={subreddit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {subreddit.subreddit_display_name.charAt(2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{subreddit.subreddit_display_name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {subreddit.subscriber_count && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {subreddit.subscriber_count.toLocaleString()}
                            </div>
                          )}
                          <span>Saved {formatDate(subreddit.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {subreddit.subreddit_description && (
                      <p className="text-muted-foreground mb-4">{subreddit.subreddit_description}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveSubreddit(subreddit)}
                      disabled={deletingSubreddit === subreddit.subreddit_name}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://reddit.com/${subreddit.subreddit_name}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && savedSubreddits.length === 0 && (
        <div className="text-center py-12">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved subreddits yet</h3>
          <p className="text-muted-foreground mb-4">
            Discover and save subreddits to easily access them when creating posts
          </p>
          <Link href="/dashboard/discover">
            <Button>
              Discover Subreddits
            </Button>
          </Link>
        </div>
      )}

      {/* No Results State */}
      {!loading && savedSubreddits.length > 0 && filteredSubreddits.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matching subreddits</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      )}

      <Toaster />
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, BookmarkPlus, BookmarkCheck, ExternalLink, Sparkles, Target } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Helper functions
function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
}

function categorizeSubreddit(sub: any): string {
  const name = sub.displayName.toLowerCase()
  const title = (sub.title || '').toLowerCase()
  const desc = (sub.description || '').toLowerCase()
  
  if (name.includes('tech') || name.includes('programming') || name.includes('dev') || 
      title.includes('tech') || title.includes('programming') || desc.includes('programming')) {
    return 'Technology'
  } else if (name.includes('business') || name.includes('startup') || name.includes('entrepreneur') ||
             title.includes('business') || title.includes('startup')) {
    return 'Business'
  } else if (name.includes('design') || name.includes('ui') || name.includes('ux') ||
             title.includes('design')) {
    return 'Design'
  } else if (name.includes('marketing') || name.includes('growth') || 
             title.includes('marketing')) {
    return 'Marketing'
  }
  return 'General'
}

function checkSelfPromoAllowed(sub: any): boolean {
  // This is a simplified check - in reality, you'd need to check the subreddit rules
  const restrictiveSubreddits = ['programming', 'webdev', 'javascript', 'reactjs', 'nextjs']
  const name = sub.displayName.toLowerCase()
  
  if (restrictiveSubreddits.includes(name)) {
    return false
  }
  
  // Most startup/entrepreneur subreddits allow self-promotion with context
  if (name.includes('startup') || name.includes('entrepreneur') || 
      name.includes('sideproject') || name.includes('indiehacker')) {
    return true
  }
  
  return sub.submissionType !== 'link' // If text posts are allowed, usually self-promo is ok with context
}

function extractTags(sub: any, keywords: string[]): string[] {
  const tags = []
  const name = sub.displayName.toLowerCase()
  
  // Add main topic as tag
  if (name.includes('startup')) tags.push('startup')
  if (name.includes('entrepreneur')) tags.push('entrepreneur')
  if (name.includes('sideproject')) tags.push('sideproject')
  if (name.includes('programming') || name.includes('dev')) tags.push('development')
  if (name.includes('design')) tags.push('design')
  if (name.includes('marketing')) tags.push('marketing')
  
  // Add matched keywords as tags
  keywords.forEach(keyword => {
    if (name.includes(keyword.toLowerCase()) || 
        (sub.description || '').toLowerCase().includes(keyword.toLowerCase())) {
      tags.push(keyword.toLowerCase())
    }
  })
  
  return [...new Set(tags)].slice(0, 5) // Return unique tags, max 5
}

export default function DiscoverPage() {
  const [productDescription, setProductDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selfPromoFilter, setSelfPromoFilter] = useState("all")
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savedSubreddits, setSavedSubreddits] = useState<string[]>([])
  const [savingSubreddit, setSavingSubreddit] = useState<string | null>(null)

  const [subreddits, setSubreddits] = useState<any[]>([])

  // Fetch saved subreddits on component mount
  useEffect(() => {
    fetchSavedSubreddits()
  }, [])

  const fetchSavedSubreddits = async () => {
    try {
      const response = await fetch('/api/subreddits/saved')
      if (response.ok) {
        const { data } = await response.json()
        setSavedSubreddits(data.map((sub: any) => sub.subreddit_name))
      }
    } catch (error) {
      console.error('Error fetching saved subreddits:', error)
    }
  }

  const handleGetRecommendations = async () => {
    if (!productDescription.trim()) {
      toast({
        title: "Product description required",
        description: "Please describe your product to get personalized recommendations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Step 1: Extract keywords from product description
      const keywordResponse = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productDescription }),
      })

      if (!keywordResponse.ok) {
        throw new Error('Failed to extract keywords')
      }

      const { keywords } = await keywordResponse.json()

      // Step 2: Search Reddit for relevant subreddits
      const searchResponse = await fetch('/api/reddit/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, limit: 20 }),
      })

      if (!searchResponse.ok) {
        throw new Error('Failed to search subreddits')
      }

      const { subreddits: searchResults } = await searchResponse.json()

      // Transform the results to match our UI format
      const formattedSubreddits = searchResults.map((sub: any) => ({
        name: sub.name,
        description: sub.description || sub.title,
        members: formatSubscriberCount(sub.subscribers),
        category: categorizeSubreddit(sub),
        allowsSelfPromo: checkSelfPromoAllowed(sub),
        tags: extractTags(sub, keywords),
        relevance: sub.relevanceScore,
        actualSubscribers: sub.subscribers,
        over18: sub.over18,
        created: sub.created,
      }))

      setSubreddits(formattedSubreddits)
      setShowRecommendations(true)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      toast({
        title: "Error",
        description: "Failed to get subreddit recommendations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter subreddits based on search and filters
  const filteredSubreddits = subreddits.filter((subreddit) => {
    const matchesSearch =
      searchQuery === "" ||
      subreddit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subreddit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subreddit.tags && subreddit.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCategory = categoryFilter === "all" || subreddit.category === categoryFilter

    const matchesSelfPromo =
      selfPromoFilter === "all" ||
      (selfPromoFilter === "allowed" && subreddit.allowsSelfPromo) ||
      (selfPromoFilter === "not-allowed" && !subreddit.allowsSelfPromo)

    return matchesSearch && matchesCategory && matchesSelfPromo
  })

  const handleSaveSubreddit = async (subreddit: any) => {
    setSavingSubreddit(subreddit.name)
    
    try {
      const response = await fetch('/api/subreddits/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddit_name: subreddit.name,
          subreddit_display_name: subreddit.name,
          subreddit_icon_url: null, // Could be enhanced with actual icon
          subreddit_description: subreddit.description,
          subscriber_count: subreddit.actualSubscribers,
        }),
      })

      if (response.ok) {
        setSavedSubreddits([...savedSubreddits, subreddit.name])
        toast({
          title: "Subreddit saved!",
          description: `${subreddit.name} has been added to your saved subreddits`,
        })
      } else if (response.status === 409) {
        toast({
          title: "Already saved",
          description: `${subreddit.name} is already in your saved subreddits`,
          variant: "default",
        })
      } else {
        throw new Error('Failed to save subreddit')
      }
    } catch (error) {
      console.error('Error saving subreddit:', error)
      toast({
        title: "Error",
        description: "Failed to save subreddit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingSubreddit(null)
    }
  }

  const handleUnsaveSubreddit = async (subreddit: any) => {
    setSavingSubreddit(subreddit.name)
    
    try {
      const response = await fetch(`/api/subreddits/save?subreddit_name=${encodeURIComponent(subreddit.name)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedSubreddits(savedSubreddits.filter(name => name !== subreddit.name))
        toast({
          title: "Subreddit removed",
          description: `${subreddit.name} has been removed from your saved subreddits`,
        })
      } else {
        throw new Error('Failed to unsave subreddit')
      }
    } catch (error) {
      console.error('Error unsaving subreddit:', error)
      toast({
        title: "Error",
        description: "Failed to remove subreddit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingSubreddit(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Discover Subreddits</h1>
        <p className="text-muted-foreground">Find communities perfect for sharing your content</p>
      </div>

      {/* Product Description Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tell us about your product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe your product, service, or project in a few sentences. For example: 'I built a web app that helps small businesses manage their social media content and schedule posts across multiple platforms...'"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{productDescription.length}/500 characters</p>
              <Button
                onClick={handleGetRecommendations}
                disabled={loading || !productDescription.trim()}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search subreddits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selfPromoFilter} onValueChange={setSelfPromoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Self-promotion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="allowed">Self-promo Allowed</SelectItem>
            <SelectItem value="not-allowed">No Self-promo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSubreddits.length} subreddit{filteredSubreddits.length !== 1 ? "s" : ""} found
          {showRecommendations && " (sorted by relevance)"}
        </p>
        {showRecommendations && (
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Recommendations
          </Badge>
        )}
      </div>

      {/* Subreddit Grid */}
      <div className="grid gap-4">
        {filteredSubreddits.map((subreddit) => (
          <Card key={subreddit.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary">{subreddit.name.charAt(2).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{subreddit.name}</h3>
                        {showRecommendations && subreddit.relevance > 0 && (
                          <Badge variant="default" className="text-xs">
                            {subreddit.relevance}% match
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {subreddit.members}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {subreddit.category}
                        </Badge>
                        <Badge variant={subreddit.allowsSelfPromo ? "default" : "outline"} className="text-xs">
                          {subreddit.allowsSelfPromo ? "Self-promo OK" : "No self-promo"}
                        </Badge>
                        {subreddit.over18 && (
                          <Badge variant="destructive" className="text-xs">
                            NSFW
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{subreddit.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {subreddit.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {savedSubreddits.includes(subreddit.name) ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUnsaveSubreddit(subreddit)}
                      disabled={savingSubreddit === subreddit.name}
                    >
                      <BookmarkCheck className="h-4 w-4 mr-1" />
                      Saved
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveSubreddit(subreddit)}
                      disabled={savingSubreddit === subreddit.name}
                    >
                      <BookmarkPlus className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://reddit.com/${subreddit.name}`, '_blank')}
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

      {/* Empty State */}
      {filteredSubreddits.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No subreddits found</h3>
          <p className="text-muted-foreground">
            {!showRecommendations
              ? "Describe your product above to get personalized recommendations"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}


      <Toaster />
    </div>
  )
}

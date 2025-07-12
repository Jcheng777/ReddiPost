"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, BookmarkPlus, ExternalLink, Sparkles, Target } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function DiscoverPage() {
  const [productDescription, setProductDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selfPromoFilter, setSelfPromoFilter] = useState("all")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [selectedSubreddit, setSelectedSubreddit] = useState<any>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [loading, setLoading] = useState(false)

  // All available subreddits
  const allSubreddits = [
    {
      name: "r/SideProject",
      description: "Share your side projects and get feedback from the community",
      members: "180K",
      category: "Technology",
      allowsSelfPromo: true,
      tags: ["sideproject", "feedback", "showcase"],
      relevance: 0, // Will be set by AI recommendations
    },
    {
      name: "r/startups",
      description: "Startup founders sharing experiences and seeking advice",
      members: "1.2M",
      category: "Business",
      allowsSelfPromo: true,
      tags: ["startup", "founder", "business"],
      relevance: 0,
    },
    {
      name: "r/webdev",
      description: "A community dedicated to all things web development",
      members: "800K",
      category: "Technology",
      allowsSelfPromo: false,
      tags: ["webdev", "programming", "frontend"],
      relevance: 0,
    },
    {
      name: "r/Entrepreneur",
      description: "A community of entrepreneurs sharing experiences and advice",
      members: "950K",
      category: "Business",
      allowsSelfPromo: true,
      tags: ["entrepreneur", "business", "advice"],
      relevance: 0,
    },
    {
      name: "r/indiehackers",
      description: "Independent developers building profitable online businesses",
      members: "85K",
      category: "Technology",
      allowsSelfPromo: true,
      tags: ["indiehacker", "bootstrap", "revenue"],
      relevance: 0,
    },
    {
      name: "r/design",
      description: "A place for design inspiration, feedback, and discussion",
      members: "450K",
      category: "Design",
      allowsSelfPromo: true,
      tags: ["design", "inspiration", "feedback"],
      relevance: 0,
    },
    {
      name: "r/marketing",
      description: "Discuss marketing strategies and industry trends",
      members: "320K",
      category: "Marketing",
      allowsSelfPromo: false,
      tags: ["marketing", "strategy", "campaigns"],
      relevance: 0,
    },
    {
      name: "r/programming",
      description: "Computer programming discussion and news",
      members: "4.2M",
      category: "Technology",
      allowsSelfPromo: false,
      tags: ["programming", "coding", "development"],
      relevance: 0,
    },
    {
      name: "r/reactjs",
      description: "A community for learning and developing with React",
      members: "320K",
      category: "Technology",
      allowsSelfPromo: false,
      tags: ["react", "javascript", "frontend"],
      relevance: 0,
    },
    {
      name: "r/nextjs",
      description: "The React framework for production applications",
      members: "45K",
      category: "Technology",
      allowsSelfPromo: false,
      tags: ["nextjs", "react", "fullstack"],
      relevance: 0,
    },
  ]

  const [subreddits, setSubreddits] = useState(allSubreddits)

  const collections = [
    { id: "1", name: "Startup Communities" },
    { id: "2", name: "Tech & Development" },
    { id: "3", name: "Marketing & Growth" },
    { id: "4", name: "Design & Creative" },
  ]

  const handleGetRecommendations = () => {
    if (!productDescription.trim()) {
      toast({
        title: "Product description required",
        description: "Please describe your product to get personalized recommendations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate AI analysis
    setTimeout(() => {
      // Mock AI recommendations based on product description
      const updatedSubreddits = allSubreddits.map((subreddit) => {
        // Simple keyword matching for demo - in real app, this would be AI-powered
        const description = productDescription.toLowerCase()
        let relevance = 0

        // Calculate relevance based on keywords and subreddit characteristics
        if (description.includes("startup") || description.includes("business")) {
          if (subreddit.name.includes("startup") || subreddit.name.includes("Entrepreneur")) relevance += 30
          if (subreddit.name.includes("SideProject")) relevance += 25
          if (subreddit.name.includes("indiehackers")) relevance += 20
        }

        if (description.includes("web") || description.includes("app") || description.includes("tool")) {
          if (subreddit.name.includes("webdev")) relevance += 25
          if (subreddit.name.includes("SideProject")) relevance += 30
          if (subreddit.name.includes("programming")) relevance += 15
        }

        if (description.includes("react") || description.includes("javascript")) {
          if (subreddit.name.includes("reactjs")) relevance += 35
          if (subreddit.name.includes("nextjs")) relevance += 30
          if (subreddit.name.includes("webdev")) relevance += 20
        }

        if (description.includes("design") || description.includes("ui") || description.includes("ux")) {
          if (subreddit.name.includes("design")) relevance += 35
          if (subreddit.name.includes("webdev")) relevance += 15
        }

        if (description.includes("marketing") || description.includes("growth")) {
          if (subreddit.name.includes("marketing")) relevance += 35
          if (subreddit.name.includes("Entrepreneur")) relevance += 20
        }

        // Add base relevance for self-promo allowed subreddits
        if (subreddit.allowsSelfPromo) relevance += 10

        // Add some randomness to make it feel more realistic
        relevance += Math.floor(Math.random() * 15)

        return { ...subreddit, relevance: Math.min(relevance, 95) }
      })

      // Sort by relevance and filter out low relevance ones
      const sortedSubreddits = updatedSubreddits
        .filter((s) => s.relevance > 10)
        .sort((a, b) => b.relevance - a.relevance)

      setSubreddits(sortedSubreddits)
      setShowRecommendations(true)
      setLoading(false)
    }, 2000)
  }

  // Filter subreddits based on search and filters
  const filteredSubreddits = subreddits.filter((subreddit) => {
    const matchesSearch =
      searchQuery === "" ||
      subreddit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subreddit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subreddit.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || subreddit.category === categoryFilter

    const matchesSelfPromo =
      selfPromoFilter === "all" ||
      (selfPromoFilter === "allowed" && subreddit.allowsSelfPromo) ||
      (selfPromoFilter === "not-allowed" && !subreddit.allowsSelfPromo)

    return matchesSearch && matchesCategory && matchesSelfPromo
  })

  const handleSaveSubreddit = (collectionId: string) => {
    toast({
      title: "Subreddit saved!",
      description: `${selectedSubreddit?.name} has been added to your collection`,
    })
    setSaveDialogOpen(false)
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSubreddit(subreddit)
                      setSaveDialogOpen(true)
                    }}
                  >
                    <BookmarkPlus className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
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

      {/* Save to Collection Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Subreddit</DialogTitle>
            <DialogDescription>Add {selectedSubreddit?.name} to one of your collections</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveSubreddit("1")}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

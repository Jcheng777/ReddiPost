"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, ThumbsUp, ArrowLeft, Sparkles, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import type { SavedSubreddit } from "@/lib/supabase"

export default function CreatePostPage() {
  const [selectedSubreddit, setSelectedSubreddit] = useState("")
  const [selectedTone, setSelectedTone] = useState("")
  const [postTitle, setPostTitle] = useState("")
  const [postBody, setPostBody] = useState("")
  const [postTldr, setPostTldr] = useState("")
  const [loading, setLoading] = useState(false)
  const [postGenerated, setPostGenerated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [productDescription, setProductDescription] = useState("")
  const [savedSubreddits, setSavedSubreddits] = useState<SavedSubreddit[]>([])
  const [loadingSubreddits, setLoadingSubreddits] = useState(true)

  // Fetch saved subreddits on component mount
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
      setLoadingSubreddits(false)
    }
  }

  const toneOptions = [
    { value: "founder-story", label: "Founder Story", description: "Share your journey and lessons learned" },
    { value: "feedback", label: "Asking for Feedback", description: "Request honest opinions and suggestions" },
    { value: "question", label: "Question", description: "Ask the community for advice or solutions" },
    { value: "free-tool", label: "Free Tool Drop", description: "Share a free resource with the community" },
  ]

  const handleGeneratePost = async () => {
    if (!selectedSubreddit || !selectedTone) {
      toast({
        title: "Missing information",
        description: "Please select both a subreddit and tone",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // For now, using a placeholder product description
      const response = await fetch('/api/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productDescription: productDescription || "a tool that helps Reddit users generate engaging posts",
          subreddit: selectedSubreddit,
          tone: selectedTone,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate post')
      }

      const data = await response.json()
      const post = data.post
      
      setPostTitle(post.title)
      setPostBody(post.body)
      setPostTldr(post.tldr)
      setPostGenerated(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    })
  }

  const saveDraft = () => {
    toast({
      title: "Draft saved!",
      description: "Your post has been saved to drafts",
    })
  }

  const selectedSubredditData = savedSubreddits.find((s) => s.subreddit_name === selectedSubreddit)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">Generate a post for your saved subreddits</p>
        </div>
      </div>

      <div className="max-w-3xl">
        {!postGenerated ? (
          /* Setup Form */
          <Card>
            <CardHeader>
              <CardTitle>Post Setup</CardTitle>
              <CardDescription>Choose your target subreddit and the tone for your post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Product Description</label>
                <Textarea
                  placeholder="Briefly describe your product, tool, or project..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This helps generate more relevant and engaging posts
                </p>
              </div>

              {/* Subreddit Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Subreddit</label>
                <Select value={selectedSubreddit} onValueChange={setSelectedSubreddit} disabled={loadingSubreddits}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSubreddits ? "Loading subreddits..." : "Choose from your saved subreddits"} />
                  </SelectTrigger>
                  <SelectContent>
                    {savedSubreddits.map((subreddit) => (
                      <SelectItem key={subreddit.id} value={subreddit.subreddit_name}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{subreddit.subreddit_display_name}</div>
                            {subreddit.subreddit_description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {subreddit.subreddit_description}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSubredditData && (
                  <div className="mt-2 p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {selectedSubredditData.subscriber_count && (
                        <Badge variant="outline">
                          {selectedSubredditData.subscriber_count.toLocaleString()} members
                        </Badge>
                      )}
                    </div>
                    {selectedSubredditData.subreddit_description && (
                      <p className="text-sm text-muted-foreground">{selectedSubredditData.subreddit_description}</p>
                    )}
                  </div>
                )}
                {!loadingSubreddits && savedSubreddits.length === 0 && (
                  <div className="mt-2 p-3 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">No saved subreddits found</p>
                    <Link href="/dashboard/discover">
                      <Button variant="outline" size="sm">
                        Discover Subreddits
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Tone Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Post Tone</label>
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the tone for your post" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        <div>
                          <div className="font-medium">{tone.label}</div>
                          <div className="text-xs text-muted-foreground">{tone.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleGeneratePost} disabled={loading || !selectedSubreddit || !selectedTone || !productDescription.trim()}>
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Post...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Post
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          /* Generated Post */
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Reddit Post</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Posting to:</span>
                  <Badge variant="secondary">{selectedSubreddit}</Badge>
                </div>
              </div>
              <CardDescription>Edit your post before sharing it on Reddit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Title:</label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(postTitle)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea value={postTitle} onChange={(e) => setPostTitle(e.target.value)} className="font-medium" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">Body:</label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(postBody)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea value={postBody} onChange={(e) => setPostBody(e.target.value)} rows={8} />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">TL;DR:</label>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(postTldr)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea value={postTldr} onChange={(e) => setPostTldr(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setPostGenerated(false)}>
                Start Over
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={saveDraft}>
                  Save Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${postTitle}\n\n${postBody}\n\nTL;DR: ${postTldr}`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Full Post
                </Button>
                <Button
                  onClick={async () => {
                    setSubmitting(true)
                    try {
                      const response = await fetch('/api/reddit/submit', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          subreddit: selectedSubreddit.replace('r/', ''),
                          title: postTitle,
                          content: `${postBody}\n\nTL;DR: ${postTldr}`,
                          kind: 'self',
                        }),
                      })

                      if (!response.ok) {
                        throw new Error('Failed to submit post')
                      }

                      const result = await response.json()
                      if (result.json?.data?.url) {
                        toast({
                          title: "Success!",
                          description: "Your post has been submitted to Reddit",
                          action: (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(result.json.data.url, '_blank')}
                            >
                              View Post
                            </Button>
                          ),
                        })
                      } else {
                        toast({
                          title: "Success!",
                          description: "Your post has been submitted to Reddit",
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to submit post to Reddit. Please try again.",
                        variant: "destructive",
                      })
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-pulse" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit to Reddit
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      <Toaster />
    </div>
  )
}

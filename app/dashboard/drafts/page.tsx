"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Calendar, Copy, Search, FileText, PenTool } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import type { Post } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<Post | null>(null)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/posts?status=draft')
      if (response.ok) {
        const { data } = await response.json()
        setDrafts(data)
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDraft = async () => {
    if (!selectedDraft) return

    try {
      const response = await fetch(`/api/posts/${selectedDraft.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDrafts(drafts.filter(d => d.id !== selectedDraft.id))
        toast({
          title: "Draft deleted",
          description: "The draft has been permanently deleted",
        })
      } else {
        throw new Error('Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast({
        title: "Error",
        description: "Failed to delete draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedDraft(null)
    }
  }

  const copyToClipboard = (draft: Post) => {
    const text = `${draft.title}\n\n${draft.body}${draft.tldr ? `\n\nTL;DR: ${draft.tldr}` : ''}`
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Draft content copied to clipboard",
    })
  }

  // Filter drafts based on search
  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch =
      searchQuery === "" ||
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.subreddit_display_name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drafts & Scheduled Posts</h1>
          <p className="text-muted-foreground">Manage your saved drafts and scheduled posts</p>
        </div>
        <Link href="/dashboard/create">
          <Button size="sm">
            <PenTool className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredDrafts.length} draft{filteredDrafts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading drafts...</p>
        </div>
      )}

      {/* Drafts */}
      {!loading && filteredDrafts.length > 0 && (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg mb-2">{draft.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{draft.subreddit_display_name}</Badge>
                      <Badge variant={draft.status === "scheduled" ? "default" : "secondary"}>{draft.status}</Badge>
                      {draft.tone && (
                        <Badge variant="secondary" className="text-xs">
                          {draft.tone.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Created {formatDate(draft.created_at)}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">{draft.body}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/dashboard/create?draft=${draft.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(draft)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    {draft.status === "scheduled" && (
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedDraft(draft)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && drafts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
          <p className="text-muted-foreground mb-4">
            Save posts as drafts to finish them later
          </p>
          <Link href="/dashboard/create">
            <Button>
              <PenTool className="h-4 w-4 mr-2" />
              Create New Post
            </Button>
          </Link>
        </div>
      )}

      {/* No Results State */}
      {!loading && drafts.length > 0 && filteredDrafts.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matching drafts</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDraft}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}

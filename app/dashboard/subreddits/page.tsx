"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  TrendingUp,
  Bookmark,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SavedSubredditsPage() {
  const [view, setView] = useState<"collections" | "all">("collections")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [newCollectionOpen, setNewCollectionOpen] = useState(false)
  const [newSubredditOpen, setNewSubredditOpen] = useState(false)

  // Mock data - in a real app, this would come from your database
  const collections = [
    {
      id: "1",
      name: "Startup Communities",
      description: "Best subreddits for sharing startup content and getting feedback",
      subredditCount: 8,
      coverImage: "/placeholder.svg?height=200&width=300",
      color: "bg-blue-500",
      subreddits: ["r/startups", "r/entrepreneur", "r/SideProject", "r/indiehackers"],
    },
    {
      id: "2",
      name: "Tech & Development",
      description: "Programming, web development, and tech discussion communities",
      subredditCount: 12,
      coverImage: "/placeholder.svg?height=200&width=300",
      color: "bg-green-500",
      subreddits: ["r/webdev", "r/programming", "r/reactjs", "r/nextjs"],
    },
    {
      id: "3",
      name: "Marketing & Growth",
      description: "Communities focused on marketing, growth hacking, and promotion",
      subredditCount: 6,
      coverImage: "/placeholder.svg?height=200&width=300",
      color: "bg-purple-500",
      subreddits: ["r/marketing", "r/growth_hacking", "r/socialmedia"],
    },
    {
      id: "4",
      name: "Design & Creative",
      description: "Design feedback, inspiration, and creative communities",
      subredditCount: 5,
      coverImage: "/placeholder.svg?height=200&width=300",
      color: "bg-pink-500",
      subreddits: ["r/design", "r/ui_design", "r/graphic_design"],
    },
  ]

  const allSubreddits = [
    {
      name: "r/startups",
      description: "A community for sharing and discussing startup experiences",
      members: "1.2M",
      category: "Business",
      allowsSelfPromo: true,
      engagement: "High",
      bestPostTime: "Tue-Thu 9-11 AM",
      tags: ["startup", "business", "entrepreneur"],
      collection: "Startup Communities",
    },
    {
      name: "r/SideProject",
      description: "Share your side projects and get feedback from the community",
      members: "180K",
      category: "Projects",
      allowsSelfPromo: true,
      engagement: "Very High",
      bestPostTime: "Mon-Wed 8-10 AM",
      tags: ["sideproject", "feedback", "showcase"],
      collection: "Startup Communities",
    },
    {
      name: "r/webdev",
      description: "A community dedicated to all things web development",
      members: "800K",
      category: "Technology",
      allowsSelfPromo: false,
      engagement: "Medium",
      bestPostTime: "Tue-Thu 10 AM-12 PM",
      tags: ["webdev", "programming", "frontend"],
      collection: "Tech & Development",
    },
    {
      name: "r/entrepreneur",
      description: "A community of entrepreneurs sharing experiences and advice",
      members: "950K",
      category: "Business",
      allowsSelfPromo: true,
      engagement: "High",
      bestPostTime: "Mon-Fri 9-11 AM",
      tags: ["entrepreneur", "business", "advice"],
      collection: "Startup Communities",
    },
    {
      name: "r/marketing",
      description: "Discuss marketing strategies, campaigns, and industry trends",
      members: "320K",
      category: "Marketing",
      allowsSelfPromo: false,
      engagement: "Medium",
      bestPostTime: "Tue-Thu 2-4 PM",
      tags: ["marketing", "strategy", "campaigns"],
      collection: "Marketing & Growth",
    },
    {
      name: "r/design",
      description: "A place for design inspiration, feedback, and discussion",
      members: "450K",
      category: "Design",
      allowsSelfPromo: true,
      engagement: "High",
      bestPostTime: "Mon-Wed 1-3 PM",
      tags: ["design", "inspiration", "feedback"],
      collection: "Design & Creative",
    },
  ]

  const filteredSubreddits = allSubreddits.filter(
    (subreddit) =>
      subreddit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subreddit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subreddit.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCreateCollection = () => {
    toast({
      title: "Collection created!",
      description: "Your new collection has been saved",
    })
    setNewCollectionOpen(false)
  }

  const handleAddSubreddit = () => {
    toast({
      title: "Subreddit added!",
      description: "The subreddit has been added to your collection",
    })
    setNewSubredditOpen(false)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Subreddits</h1>
          <p className="text-muted-foreground">Organize and manage your favorite Reddit communities</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={newSubredditOpen} onOpenChange={setNewSubredditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Subreddit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subreddit</DialogTitle>
                <DialogDescription>Add a subreddit to your saved collections</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subreddit-name">Subreddit Name</Label>
                  <Input id="subreddit-name" placeholder="r/example" />
                </div>
                <div>
                  <Label htmlFor="collection-select">Add to Collection</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
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
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" placeholder="Add any notes about this subreddit..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewSubredditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSubreddit}>Add Subreddit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>Organize your subreddits into themed collections</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collection-name">Collection Name</Label>
                  <Input id="collection-name" placeholder="e.g., Tech Communities" />
                </div>
                <div>
                  <Label htmlFor="collection-description">Description</Label>
                  <Textarea id="collection-description" placeholder="Describe what this collection is for..." />
                </div>
                <div>
                  <Label htmlFor="collection-color">Color Theme</Label>
                  <div className="flex gap-2 mt-2">
                    {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-red-500"].map(
                      (color) => (
                        <div
                          key={color}
                          className={`w-8 h-8 rounded-full ${color} cursor-pointer border-2 border-transparent hover:border-gray-300`}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewCollectionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCollection}>Create Collection</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search subreddits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "collections" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("collections")}
          >
            Collections
          </Button>
          <Button variant={view === "all" ? "default" : "outline"} size="sm" onClick={() => setView("all")}>
            All Subreddits
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Collections View */}
      {view === "collections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="relative">
                <div className={`h-32 ${collection.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Collection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{collection.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{collection.subredditCount} subreddits</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCollection(collection.id)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* All Subreddits View */}
      {view === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubreddits.map((subreddit) => (
            <Card key={subreddit.name} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{subreddit.name.charAt(2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{subreddit.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {subreddit.members} members
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Subreddit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subreddit.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Self-promotion:</span>
                    <Badge variant={subreddit.allowsSelfPromo ? "default" : "secondary"}>
                      {subreddit.allowsSelfPromo ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Engagement:</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span
                        className={`font-medium ${
                          subreddit.engagement === "Very High"
                            ? "text-green-600"
                            : subreddit.engagement === "High"
                              ? "text-blue-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {subreddit.engagement}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Best time to post:</span>
                    <p className="font-medium">{subreddit.bestPostTime}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {subreddit.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Collection: </span>
                    <span className="text-xs font-medium">{subreddit.collection}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {view === "all" && filteredSubreddits.length === 0 && (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No subreddits found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Start by adding some subreddits to your collections"}
          </p>
          <Button onClick={() => setNewSubredditOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Subreddit
          </Button>
        </div>
      )}

      <Toaster />
    </div>
  )
}

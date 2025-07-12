"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, Copy } from "lucide-react"

export default function DraftsPage() {
  const drafts = [
    {
      id: 1,
      title: "[Feedback Request] Would this solve your problem?",
      subreddit: "r/startups",
      status: "draft",
      createdAt: "1 day ago",
      lastModified: "2 hours ago",
    },
    {
      id: 2,
      title: "I made a free tool that helps with Reddit marketing",
      subreddit: "r/SideProject",
      status: "scheduled",
      createdAt: "3 days ago",
      scheduledFor: "Tomorrow 9:00 AM",
    },
    {
      id: 3,
      title: "Has anyone found a good solution for content marketing?",
      subreddit: "r/Entrepreneur",
      status: "draft",
      createdAt: "1 week ago",
      lastModified: "5 days ago",
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Drafts & Scheduled Posts</h1>
          <p className="text-muted-foreground">Manage your saved drafts and scheduled posts</p>
        </div>
      </div>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <Card key={draft.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg mb-2">{draft.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{draft.subreddit}</Badge>
                    <Badge variant={draft.status === "scheduled" ? "default" : "secondary"}>{draft.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {draft.createdAt}
                    {draft.status === "scheduled"
                      ? ` • Scheduled for ${draft.scheduledFor}`
                      : ` • Last modified ${draft.lastModified}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  {draft.status === "scheduled" && (
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

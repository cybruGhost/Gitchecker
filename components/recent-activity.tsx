"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface RecentActivityProps {
  username: string
}

export function RecentActivity({ username }: RecentActivityProps) {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch user events from GitHub API
        const response = await fetch(`https://api.github.com/users/${username}/events?per_page=10`)

        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.statusText}`)
        }

        const events = await response.json()
        setActivities(events)
      } catch (error) {
        console.error("Error fetching activity:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [username])

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  // Get event description
  const getEventDescription = (event: any) => {
    switch (event.type) {
      case "PushEvent":
        return {
          title: `Pushed ${event.payload.size} commit${event.payload.size !== 1 ? "s" : ""} to ${event.payload.ref?.replace("refs/heads/", "")}`,
          repo: event.repo.name,
          badge: "Commit",
        }
      case "PullRequestEvent":
        return {
          title: `${event.payload.action === "opened" ? "Opened" : event.payload.action === "closed" ? (event.payload.pull_request.merged ? "Merged" : "Closed") : event.payload.action} pull request #${event.payload.number}: ${event.payload.pull_request.title}`,
          repo: event.repo.name,
          badge: "PR",
        }
      case "IssuesEvent":
        return {
          title: `${event.payload.action === "opened" ? "Opened" : event.payload.action} issue #${event.payload.issue.number}: ${event.payload.issue.title}`,
          repo: event.repo.name,
          badge: "Issue",
        }
      case "CreateEvent":
        return {
          title: `Created ${event.payload.ref_type}${event.payload.ref ? ` ${event.payload.ref}` : ""}`,
          repo: event.repo.name,
          badge: "Create",
        }
      case "DeleteEvent":
        return {
          title: `Deleted ${event.payload.ref_type} ${event.payload.ref}`,
          repo: event.repo.name,
          badge: "Delete",
        }
      case "IssueCommentEvent":
        return {
          title: `Commented on issue #${event.payload.issue.number}: ${event.payload.issue.title}`,
          repo: event.repo.name,
          badge: "Comment",
        }
      case "WatchEvent":
        return {
          title: "Starred repository",
          repo: event.repo.name,
          badge: "Star",
        }
      case "ForkEvent":
        return {
          title: "Forked repository",
          repo: event.repo.name,
          badge: "Fork",
        }
      default:
        return {
          title: event.type.replace("Event", ""),
          repo: event.repo.name,
          badge: "Activity",
        }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Real-time activity from GitHub</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No recent activity found</div>
          ) : (
            activities.map((event, index) => {
              const eventInfo = getEventDescription(event)
              return (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{eventInfo.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {eventInfo.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      in <span className="font-medium">{eventInfo.repo}</span> • {formatRelativeTime(event.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

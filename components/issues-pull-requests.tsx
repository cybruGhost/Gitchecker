"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, GitMerge, AlertCircle, CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import apiCache from "@/lib/api-cache"

interface IssuesPullRequestsProps {
  username: string
  repo: string
}

export function IssuesPullRequests({ username, repo }: IssuesPullRequestsProps) {
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<any[]>([])
  const [pullRequests, setPullRequests] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssuesAndPRs = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch open issues with caching
        const issuesData = await apiCache.fetchWithCache(
          `https://api.github.com/repos/${username}/${repo}/issues?state=all&per_page=5`,
        )

        // Separate issues and pull requests
        // In GitHub's API, issues endpoint returns both issues and PRs
        const issuesOnly = issuesData.filter((item: any) => !item.pull_request)
        setIssues(issuesOnly)

        // Fetch pull requests separately to get more details
        const pullsData = await apiCache.fetchWithCache(
          `https://api.github.com/repos/${username}/${repo}/pulls?state=all&per_page=5`,
        )

        setPullRequests(pullsData)
      } catch (error) {
        console.error("Error fetching issues and PRs:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchIssuesAndPRs()
  }, [username, repo])

  // Format date to relative time (e.g., "2 days ago")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues & Pull Requests</CardTitle>
        <CardDescription>Track issues and pull requests for this repository</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="issues">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {issues.filter((issue) => issue.state === "open").length} Open
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {issues.filter((issue) => issue.state === "closed").length} Closed
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://github.com/${username}/${repo}/issues`} target="_blank" rel="noopener noreferrer">
                      View All Issues
                    </a>
                  </Button>
                </div>

                {issues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No issues found</div>
                ) : (
                  <div className="space-y-2">
                    {issues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          {issue.state === "open" ? (
                            <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                <a
                                  href={issue.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {issue.title} <span className="text-muted-foreground">#{issue.number}</span>
                                </a>
                              </h3>
                              <Badge variant={issue.state === "open" ? "default" : "secondary"}>{issue.state}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Opened {formatRelativeTime(issue.created_at)} by{" "}
                              <a
                                href={issue.user.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {issue.user.login}
                              </a>
                              {issue.state === "closed" && issue.closed_at && (
                                <> • Closed {formatRelativeTime(issue.closed_at)}</>
                              )}
                              {issue.comments > 0 && (
                                <>
                                  {" "}
                                  • {issue.comments} comment{issue.comments > 1 ? "s" : ""}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pull-requests" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GitPullRequest className="h-3 w-3" />
                      {pullRequests.filter((pr) => pr.state === "open").length} Open
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GitMerge className="h-3 w-3" />
                      {pullRequests.filter((pr) => pr.merged_at).length} Merged
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {pullRequests.filter((pr) => pr.state === "closed" && !pr.merged_at).length} Closed
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://github.com/${username}/${repo}/pulls`} target="_blank" rel="noopener noreferrer">
                      View All PRs
                    </a>
                  </Button>
                </div>

                {pullRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pull requests found</div>
                ) : (
                  <div className="space-y-2">
                    {pullRequests.map((pr) => (
                      <div key={pr.id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          {pr.state === "open" ? (
                            <GitPullRequest className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : pr.merged_at ? (
                            <GitMerge className="h-5 w-5 text-purple-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                <a
                                  href={pr.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {pr.title} <span className="text-muted-foreground">#{pr.number}</span>
                                </a>
                              </h3>
                              <Badge variant={pr.state === "open" ? "default" : pr.merged_at ? "secondary" : "outline"}>
                                {pr.merged_at ? "merged" : pr.state}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Opened {formatRelativeTime(pr.created_at)} by{" "}
                              <a
                                href={pr.user.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {pr.user.login}
                              </a>
                              {pr.merged_at && <> • Merged {formatRelativeTime(pr.merged_at)}</>}
                              {pr.state === "closed" && !pr.merged_at && pr.closed_at && (
                                <> • Closed {formatRelativeTime(pr.closed_at)}</>
                              )}
                              {pr.comments > 0 && (
                                <>
                                  {" "}
                                  • {pr.comments} comment{pr.comments > 1 ? "s" : ""}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

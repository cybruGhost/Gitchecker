import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, GitMerge, AlertCircle } from "lucide-react"

interface PullRequestsProps {
  username: string
}

export function PullRequests({ username }: PullRequestsProps) {
  // Mock data for demonstration
  const pullRequests = [
    {
      id: 1,
      title: "Add new feature",
      repo: "project-name",
      status: "open",
      created: "2023-05-15T10:30:00Z",
    },
    {
      id: 2,
      title: "Fix bug in authentication",
      repo: "project-name",
      status: "merged",
      created: "2023-05-10T14:20:00Z",
    },
    {
      id: 3,
      title: "Update documentation",
      repo: "docs-repo",
      status: "closed",
      created: "2023-05-05T09:15:00Z",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pull Requests</CardTitle>
        <CardDescription>View pull request activity and status</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="created">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="created">Created</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="mentioned">Mentioned</TabsTrigger>
          </TabsList>
          <TabsContent value="created" className="pt-4">
            <div className="space-y-4">
              {pullRequests.map((pr) => (
                <div key={pr.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {pr.status === "open" && <GitPullRequest className="h-5 w-5 text-emerald-500 mt-0.5" />}
                      {pr.status === "merged" && <GitMerge className="h-5 w-5 text-purple-500 mt-0.5" />}
                      {pr.status === "closed" && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                      <div>
                        <p className="font-medium">{pr.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {pr.repo} • Created {new Date(pr.created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={pr.status === "open" ? "default" : pr.status === "merged" ? "secondary" : "outline"}
                    >
                      {pr.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Note: This is sample data. Real pull request data requires GitHub API authentication
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="assigned" className="pt-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Assigned pull requests require GitHub API authentication</p>
            </div>
          </TabsContent>
          <TabsContent value="mentioned" className="pt-4">
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Mentioned pull requests require GitHub API authentication</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

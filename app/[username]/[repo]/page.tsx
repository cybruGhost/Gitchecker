import { notFound } from "next/navigation"
import { RepositoryViewer } from "@/components/repository-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageBreakdown } from "@/components/language-breakdown"
import { CommitActivity } from "@/components/commit-activity"
import { IssuesPullRequests } from "@/components/issues-pull-requests"

async function getRepository(username: string, repo: string) {
  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return notFound()
      }
      throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`)
    }

    return await repoResponse.json()
  } catch (error) {
    console.error("Error fetching repository:", error)
    throw error
  }
}

async function getReadme(username: string, repo: string) {
  try {
    const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/readme`, {
      next: { revalidate: 3600 },
    })

    if (!readmeResponse.ok) {
      return null
    }

    const readmeData = await readmeResponse.json()
    return {
      content: atob(readmeData.content), // Decode base64 content
      path: readmeData.path,
      html_url: readmeData.html_url,
    }
  } catch (error) {
    console.error("Error fetching README:", error)
    return null
  }
}

async function getLanguages(username: string, repo: string) {
  try {
    const languagesResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/languages`, {
      next: { revalidate: 3600 },
    })

    if (!languagesResponse.ok) {
      return {}
    }

    return await languagesResponse.json()
  } catch (error) {
    console.error("Error fetching languages:", error)
    return {}
  }
}

export default async function RepositoryPage({ params }: { params: { username: string; repo: string } }) {
  const { username, repo } = params

  try {
    const repository = await getRepository(username, repo)
    const readme = await getReadme(username, repo)
    const languages = await getLanguages(username, repo)

    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{repository.name}</CardTitle>
                <CardDescription>{repository.description}</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{repository.stargazers_count}</p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{repository.forks_count}</p>
                  <p className="text-xs text-muted-foreground">Forks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{repository.watchers_count}</p>
                  <p className="text-xs text-muted-foreground">Watchers</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {repository.topics &&
                repository.topics.map((topic: string) => (
                  <span key={topic} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {topic}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="issues">Issues & PRs</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-6">
            <RepositoryViewer username={username} repo={repo} defaultReadme={readme} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <LanguageBreakdown languages={languages} />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <CommitActivity username={username} repo={repo} />
          </TabsContent>

          <TabsContent value="issues" className="mt-6">
            <IssuesPullRequests username={username} repo={repo} />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error Loading Repository</h2>
          <p>There was a problem loading this repository. Please try again later.</p>
        </div>
      </div>
    )
  }
}

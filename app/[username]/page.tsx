import { UserProfile } from "@/components/user-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Repositories } from "@/components/repositories"
import { Analytics } from "@/components/analytics"
import { SocialInsights } from "@/components/social-insights"
import { RecentActivity } from "@/components/recent-activity"
import { ContributionCalendar } from "@/components/contribution-calendar"
import { notFound } from "next/navigation"
import { SearchBar } from "@/components/search-bar"

async function getGitHubUser(username: string) {
  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return notFound()
      }
      throw new Error(`Failed to fetch user data: ${userResponse.statusText}`)
    }

    return await userResponse.json()
  } catch (error) {
    console.error("Error fetching GitHub user:", error)
    throw error
  }
}

async function getRepositories(username: string) {
  try {
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!reposResponse.ok) {
      throw new Error(`Failed to fetch repositories: ${reposResponse.statusText}`)
    }

    return await reposResponse.json()
  } catch (error) {
    console.error("Error fetching repositories:", error)
    throw error
  }
}

async function getPinnedRepos(username: string) {
  // GitHub API doesn't directly expose pinned repos
  // This is a workaround using GraphQL, but for this demo we'll return top repos by stars
  const repos = await getRepositories(username)
  return repos.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count).slice(0, 6)
}

async function getProfileReadme(username: string) {
  try {
    const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${username}/contents/README.md`, {
      next: { revalidate: 3600 },
    })

    if (!readmeResponse.ok) {
      return null
    }

    const readmeData = await readmeResponse.json()
    return atob(readmeData.content) // Decode base64 content
  } catch (error) {
    console.error("Error fetching profile README:", error)
    return null
  }
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = params

  try {
    const userData = await getGitHubUser(username)
    const repositories = await getRepositories(username)
    const pinnedRepos = await getPinnedRepos(username)
    const profileReadme = await getProfileReadme(username)

    const completeUserData = {
      ...userData,
      repositories,
      pinnedRepos,
      profileReadme,
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <SearchBar />
        </div>

        <UserProfile user={completeUserData} />

        <div className="mt-8">
          <Tabs defaultValue="repositories" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="repositories" className="mt-6">
              <Repositories repositories={repositories} username={username} />
            </TabsContent>

            <TabsContent value="contributions" className="mt-6">
              <ContributionCalendar username={username} />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <RecentActivity username={username} />
            </TabsContent>

            <TabsContent value="social" className="mt-6">
              <SocialInsights username={username} userData={userData} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Analytics username={username} repositories={repositories} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error Loading Profile</h2>
          <p>There was a problem loading this GitHub profile. Please try again later.</p>
        </div>
      </div>
    )
  }
}

import { CalendarDays, Github, MapPin, Users, Star, GitFork, LinkIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContributionCalendar } from "@/components/contribution-calendar"

interface UserProfileProps {
  user: {
    login: string
    name: string | null
    avatar_url: string
    html_url: string
    bio: string | null
    public_repos: number
    followers: number
    following: number
    location: string | null
    blog?: string
    twitter_username?: string | null
    company?: string | null
    email?: string | null
    created_at: string
    repositories: any[]
    pinnedRepos: any[]
    profileReadme: string | null
  }
}

export function UserProfile({ user }: UserProfileProps) {
  // Calculate total stars across all repositories
  const totalStars = user.repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)

  // Calculate total forks across all repositories
  const totalForks = user.repositories.reduce((sum, repo) => sum + repo.forks_count, 0)

  // Format date
  const formattedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
              <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-2xl">{user.name || user.login}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  @{user.login}
                </a>
              </CardDescription>
              {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                {user.location && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <MapPin className="h-3 w-3" />
                    {user.location}
                  </Badge>
                )}
                {user.company && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Users className="h-3 w-3" />
                    {user.company}
                  </Badge>
                )}
                {user.blog && (
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <LinkIcon className="h-3 w-3" />
                    <a
                      href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Website
                    </a>
                  </Badge>
                )}
                <Badge variant="secondary" className="flex gap-1 items-center">
                  <CalendarDays className="h-3 w-3" />
                  Joined {formattedDate}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={user.html_url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{user.public_repos}</p>
              <p className="text-xs text-muted-foreground uppercase">Repositories</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{user.followers}</p>
              <p className="text-xs text-muted-foreground uppercase">Followers</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{totalStars}</p>
              <p className="text-xs text-muted-foreground uppercase">Stars</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{totalForks}</p>
              <p className="text-xs text-muted-foreground uppercase">Forks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Repositories */}
      {user.pinnedRepos && user.pinnedRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pinned Repositories</CardTitle>
            <CardDescription>Top repositories by stars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.pinnedRepos.map((repo) => (
                <Card key={repo.id} className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Link href={`/${user.login}/${repo.name}`} className="hover:underline">
                        {repo.name}
                      </Link>
                    </CardTitle>
                    {repo.description && <CardDescription className="line-clamp-2">{repo.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-4 w-4 text-muted-foreground" />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>
                      {repo.language && <Badge variant="outline">{repo.language}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>Contribution history over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionCalendar username={user.login} />
        </CardContent>
      </Card>

      {/* Profile README */}
      {user.profileReadme && (
        <Card>
          <CardHeader>
            <CardTitle>Profile README</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap">{user.profileReadme}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

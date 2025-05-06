"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SocialInsightsProps {
  username: string
  userData: any
}

export function SocialInsights({ username, userData }: SocialInsightsProps) {
  const [loading, setLoading] = useState(true)
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSocialData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch followers (limited to 10 for performance)
        const followersResponse = await fetch(`https://api.github.com/users/${username}/followers?per_page=10`)
        if (!followersResponse.ok) {
          throw new Error(`Failed to fetch followers: ${followersResponse.statusText}`)
        }
        const followersData = await followersResponse.json()
        setFollowers(followersData)

        // Fetch following (limited to 10 for performance)
        const followingResponse = await fetch(`https://api.github.com/users/${username}/following?per_page=10`)
        if (!followingResponse.ok) {
          throw new Error(`Failed to fetch following: ${followingResponse.statusText}`)
        }
        const followingData = await followingResponse.json()
        setFollowing(followingData)

        // Fetch organizations with more details
        const orgsResponse = await fetch(`https://api.github.com/users/${username}/orgs`)
        if (!orgsResponse.ok) {
          throw new Error(`Failed to fetch organizations: ${orgsResponse.statusText}`)
        }
        const orgsData = await orgsResponse.json()

        // Fetch additional details for each organization
        const orgsWithDetails = await Promise.all(
          orgsData.map(async (org: any) => {
            try {
              const orgDetailsResponse = await fetch(`https://api.github.com/orgs/${org.login}`)
              if (orgDetailsResponse.ok) {
                const orgDetails = await orgDetailsResponse.json()
                return { ...org, ...orgDetails }
              }
              return org
            } catch (error) {
              console.error(`Error fetching details for org ${org.login}:`, error)
              return org
            }
          }),
        )

        setOrganizations(orgsWithDetails)
      } catch (error) {
        console.error("Error fetching social data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchSocialData()
  }, [username])

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Insights</CardTitle>
          <CardDescription>Explore {username}'s social connections and community engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="followers">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
            </TabsList>

            <TabsContent value="followers" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Recent Followers</h3>
                  {followers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No followers found</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {followers.map((follower) => (
                        <div key={follower.id} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={follower.avatar_url || "/placeholder.svg"} alt={follower.login} />
                            <AvatarFallback>{follower.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Link href={`/${follower.login}`} className="text-sm hover:underline font-medium">
                              {follower.login}
                            </Link>
                            <a
                              href={follower.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:underline flex items-center"
                            >
                              GitHub <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {followers.length > 0 && followers.length < userData.followers && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://github.com/${username}?tab=followers`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          View all {userData.followers} followers
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-4">Follower Stats</h3>
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{userData.followers}</p>
                      <p className="text-sm text-muted-foreground">Total Followers</p>
                    </div>
                    {followers.length > 0 && (
                      <div className="text-sm text-muted-foreground text-center">
                        Showing {followers.length} of {userData.followers} followers
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="following" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Following</h3>
                  {following.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">Not following anyone</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {following.map((user) => (
                        <div key={user.id} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.login} />
                            <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Link href={`/${user.login}`} className="text-sm hover:underline font-medium">
                              {user.login}
                            </Link>
                            <a
                              href={user.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:underline flex items-center"
                            >
                              GitHub <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {following.length > 0 && following.length < userData.following && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://github.com/${username}?tab=following`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          View all {userData.following} following
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-4">Following Stats</h3>
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{userData.following}</p>
                      <p className="text-sm text-muted-foreground">Total Following</p>
                    </div>
                    {following.length > 0 && (
                      <div className="text-sm text-muted-foreground text-center">
                        Showing {following.length} of {userData.following} users followed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organizations" className="pt-6">
              {organizations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {username} is not a member of any public organizations
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {organizations.map((org) => (
                    <Card key={org.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={org.avatar_url || "/placeholder.svg"} alt={org.login} />
                            <AvatarFallback>{org.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-medium">{org.name || org.login}</h3>
                          {org.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{org.description}</p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            Member
                          </Badge>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://github.com/${org.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                View on GitHub
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                            {org.blog && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={org.blog.startsWith("http") ? org.blog : `https://${org.blog}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Website
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

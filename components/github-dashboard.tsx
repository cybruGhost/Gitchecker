"use client"

import type React from "react"

import { useState } from "react"
import { Search, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function GithubDashboard() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Check if user exists before navigating
      const userResponse = await fetch(`https://api.github.com/users/${username}`)

      if (!userResponse.ok) {
        throw new Error(userResponse.status === 404 ? "User not found" : "Error fetching GitHub data")
      }

      // Navigate to user profile page
      router.push(`/${username}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Recent popular GitHub users for quick access
  const popularUsers = ["microsoft", "google", "facebook", "vercel", "tailwindlabs", "shadcn"]

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Github className="h-8 w-8" />
            <div>
              <CardTitle>GitHub Insights Explorer</CardTitle>
              <CardDescription>
                Enter a GitHub username to explore their profile, repositories, and analytics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="GitHub username (e.g., microsoft)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Search
                </span>
              )}
            </Button>
          </form>

          {error && <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Popular Profiles</h3>
            <div className="flex flex-wrap gap-2">
              {popularUsers.map((user) => (
                <Button
                  key={user}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUsername(user)
                    router.push(`/${user}`)
                  }}
                >
                  {user}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View detailed user profiles with followers, repositories, and contribution history
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Repository Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse repositories, view code, and explore file structures with syntax highlighting
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize language usage, commit frequency, and community engagement metrics
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

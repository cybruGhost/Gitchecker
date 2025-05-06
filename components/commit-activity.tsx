"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import apiCache from "@/lib/api-cache"

interface CommitActivityProps {
  username: string
  repo: string
}

export function CommitActivity({ username, repo }: CommitActivityProps) {
  const [loading, setLoading] = useState(true)
  const [commitData, setCommitData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommitActivity = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch commit activity stats from GitHub API with caching
        const data = await apiCache.fetchWithCache(
          `https://api.github.com/repos/${username}/${repo}/stats/commit_activity`,
        )

        // Process the data for the chart
        // GitHub returns 52 weeks of data with total commits per week
        const processedData = data.slice(-12).map((week: any) => {
          const date = new Date(week.week * 1000) // Convert Unix timestamp to date
          return {
            week: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            commits: week.total,
          }
        })

        setCommitData(processedData)
      } catch (error) {
        console.error("Error fetching commit activity:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCommitActivity()
  }, [username, repo])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commit Activity</CardTitle>
        <CardDescription>Weekly commit frequency over the last 12 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : commitData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No commit data available for this repository</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={commitData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commits" fill="#3b82f6" name="Commits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

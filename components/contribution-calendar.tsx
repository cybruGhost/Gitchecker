"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Flame, Calendar, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import apiCache from "@/lib/api-cache"

interface ContributionCalendarProps {
  username: string
}

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface ContributionData {
  weeks: ContributionDay[][]
  totalContributions: number
  currentStreak: number
  longestStreak: number
}

export function ContributionCalendar({ username }: ContributionCalendarProps) {
  const [loading, setLoading] = useState(true)
  const [contributionData, setContributionData] = useState<ContributionData | null>(null)
  const [yearView, setYearView] = useState<"current" | "previous" | "both">("current")
  const [error, setError] = useState<string | null>(null)
  const [currentYearData, setCurrentYearData] = useState<ContributionData | null>(null)
  const [previousYearData, setPreviousYearData] = useState<ContributionData | null>(null)
  const [bothYearsData, setBothYearsData] = useState<ContributionData | null>(null)

  useEffect(() => {
    const fetchContributionData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch user events with caching
        const currentYearEvents = await fetchUserEvents(username, 0)
        const currentYearData = processEvents(currentYearEvents, 0)
        setCurrentYearData(currentYearData)

        // Fetch user events for previous year
        const previousYearEvents = await fetchUserEvents(username, 1)
        const previousYearData = processEvents(previousYearEvents, 1)
        setPreviousYearData(previousYearData)

        // Combine both years
        const bothYearsData = combineYearData(currentYearData, previousYearData)
        setBothYearsData(bothYearsData)

        // Set initial data based on selected view
        if (yearView === "current") {
          setContributionData(currentYearData)
        } else if (yearView === "previous") {
          setContributionData(previousYearData)
        } else {
          setContributionData(bothYearsData)
        }
      } catch (error) {
        console.error("Error fetching contribution data:", error)
        setError("Failed to load contribution data. GitHub API rate limits may apply.")
      } finally {
        setLoading(false)
      }
    }

    fetchContributionData()
  }, [username])

  // Update displayed data when year view changes
  useEffect(() => {
    if (yearView === "current" && currentYearData) {
      setContributionData(currentYearData)
    } else if (yearView === "previous" && previousYearData) {
      setContributionData(previousYearData)
    } else if (yearView === "both" && bothYearsData) {
      setContributionData(bothYearsData)
    }
  }, [yearView, currentYearData, previousYearData, bothYearsData])

  // Fetch user events for a specific year with caching
  const fetchUserEvents = async (username: string, yearsAgo: number) => {
    try {
      // Use the cache to fetch events
      const events = await apiCache.fetchWithCache(`https://api.github.com/users/${username}/events?per_page=100`)

      // Filter events by year
      const now = new Date()
      const targetYear = now.getFullYear() - yearsAgo
      return events.filter((event: any) => {
        const eventDate = new Date(event.created_at)
        return eventDate.getFullYear() === targetYear
      })
    } catch (error) {
      console.error("Error fetching user events:", error)
      throw error
    }
  }

  // Process events to create contribution data
  const processEvents = (events: any[], yearsAgo: number) => {
    const contributionMap = new Map<string, number>()
    const now = new Date()
    const startDate = new Date(now)
    startDate.setFullYear(now.getFullYear() - yearsAgo)
    startDate.setMonth(0, 1) // January 1st

    const endDate = new Date(now)
    if (yearsAgo > 0) {
      endDate.setFullYear(now.getFullYear() - yearsAgo)
      endDate.setMonth(11, 31) // December 31st
    }

    // Initialize all dates in the year with 0 contributions
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      contributionMap.set(dateStr, 0)
    }

    // Count contributions from events
    events.forEach((event: any) => {
      const date = new Date(event.created_at)
      const dateStr = date.toISOString().split("T")[0]

      if (contributionMap.has(dateStr)) {
        // Different event types contribute differently
        let contributionCount = 0

        switch (event.type) {
          case "PushEvent":
            // Each commit in a push counts
            contributionCount = event.payload.size || 1
            break
          case "PullRequestEvent":
            if (event.payload.action === "opened" || event.payload.action === "closed") {
              contributionCount = 1
            }
            break
          case "IssuesEvent":
            if (event.payload.action === "opened" || event.payload.action === "closed") {
              contributionCount = 1
            }
            break
          case "IssueCommentEvent":
          case "PullRequestReviewCommentEvent":
          case "CommitCommentEvent":
            contributionCount = 1
            break
          default:
            contributionCount = 0
        }

        contributionMap.set(dateStr, (contributionMap.get(dateStr) || 0) + contributionCount)
      }
    })

    // Create weeks array for the contribution calendar
    const weeks: ContributionDay[][] = []
    let currentWeek: ContributionDay[] = []
    let totalContributions = 0

    // Sort dates and create contribution days
    const sortedDates = Array.from(contributionMap.entries()).sort(
      ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime(),
    )

    sortedDates.forEach(([dateStr, count], index) => {
      const date = new Date(dateStr)
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

      // Determine level based on count
      let level = 0
      if (count > 0) {
        if (count <= 3) level = 1
        else if (count <= 8) level = 2
        else if (count <= 15) level = 3
        else level = 4
      }

      totalContributions += count

      // Start a new week on Sunday
      if (dayOfWeek === 0) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek)
          currentWeek = []
        }
      }

      currentWeek.push({ date: dateStr, count, level })

      // Push the last week
      if (index === sortedDates.length - 1 && currentWeek.length > 0) {
        weeks.push(currentWeek)
      }
    })

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(sortedDates)

    return {
      weeks,
      totalContributions,
      currentStreak,
      longestStreak,
    }
  }

  // Combine data from two years
  const combineYearData = (currentYear: ContributionData | null, previousYear: ContributionData | null) => {
    if (!currentYear || !previousYear) {
      return currentYear || previousYear || null
    }

    const combinedWeeks = [...previousYear.weeks, ...currentYear.weeks]
    const totalContributions = currentYear.totalContributions + previousYear.totalContributions
    const longestStreak = Math.max(currentYear.longestStreak, previousYear.longestStreak)

    return {
      weeks: combinedWeeks,
      totalContributions,
      currentStreak: currentYear.currentStreak, // Current streak is from current year
      longestStreak,
    }
  }

  // Calculate current and longest contribution streaks
  const calculateStreaks = (sortedDates: [string, number][]) => {
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Reverse the array to start from the most recent date
    const reversedDates = [...sortedDates].reverse()

    // Calculate current streak (consecutive days from today)
    const today = new Date().toISOString().split("T")[0]
    let foundToday = false

    for (let i = 0; i < reversedDates.length; i++) {
      const [dateStr, count] = reversedDates[i]

      // Check if we've found today's date
      if (!foundToday && dateStr === today) {
        foundToday = true
      }

      // If we've found today and there are contributions, increment the streak
      if (foundToday) {
        if (count > 0) {
          currentStreak++

          // Check if the next date is consecutive
          if (i < reversedDates.length - 1) {
            const currentDate = new Date(dateStr)
            const nextDate = new Date(reversedDates[i + 1][0])

            // Calculate the difference in days
            const diffTime = Math.abs(currentDate.getTime() - nextDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            // If the difference is more than 1 day, the streak is broken
            if (diffDays > 1) {
              break
            }
          }
        } else {
          // No contributions today, streak is 0
          if (i === 0) {
            currentStreak = 0
          }
          break
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      const [_, count] = sortedDates[i]

      if (count > 0) {
        tempStreak++

        // Check if this is the last date or if the next date is consecutive
        if (i === sortedDates.length - 1) {
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          const currentDate = new Date(sortedDates[i][0])
          const nextDate = new Date(sortedDates[i + 1][0])

          // Calculate the difference in days
          const diffTime = Math.abs(nextDate.getTime() - currentDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          // If the difference is more than 1 day, the streak is broken
          if (diffDays > 1) {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 0
          }
        }
      } else {
        // No contributions this day, streak is broken
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
      }
    }

    return { currentStreak, longestStreak }
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

  if (!contributionData) {
    return <div className="text-center py-8 text-muted-foreground">No contribution data available</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Contribution Activity</CardTitle>
            <CardDescription>Real contribution history and activity patterns</CardDescription>
          </div>
          <Tabs defaultValue={yearView} onValueChange={(value) => setYearView(value as any)}>
            <TabsList>
              <TabsTrigger value="current">This Year</TabsTrigger>
              <TabsTrigger value="previous">Last Year</TabsTrigger>
              <TabsTrigger value="both">Both Years</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Streak information */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">{contributionData.currentStreak}</span>
                <span className="text-muted-foreground">day streak</span>
              </Badge>

              <Badge variant="outline" className="h-8 px-3 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{contributionData.totalContributions}</span>
                <span className="text-muted-foreground">contributions</span>
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              Longest streak: <span className="font-medium">{contributionData.longestStreak} days</span>
            </div>
          </div>

          {contributionData.currentStreak > 0 && (
            <Alert>
              <Flame className="h-4 w-4 text-orange-500" />
              <AlertTitle>Active Streak: {contributionData.currentStreak} days</AlertTitle>
              <AlertDescription>
                You're on a roll! Don't break your streak - make a contribution today to keep it going.
              </AlertDescription>
            </Alert>
          )}

          {/* Contribution calendar */}
          <div>
            <h3 className="text-sm font-medium mb-2">Contribution Calendar</h3>
            <div className="border rounded-lg p-4 overflow-x-auto">
              <div className="flex gap-1 min-w-[750px]">
                {contributionData.weeks.map((week, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      // Determine color based on contribution level
                      let bgColor
                      switch (day.level) {
                        case 0:
                          bgColor = "bg-muted"
                          break
                        case 1:
                          bgColor = "bg-emerald-100 dark:bg-emerald-950"
                          break
                        case 2:
                          bgColor = "bg-emerald-300 dark:bg-emerald-800"
                          break
                        case 3:
                          bgColor = "bg-emerald-500 dark:bg-emerald-600"
                          break
                        case 4:
                          bgColor = "bg-emerald-700 dark:bg-emerald-400"
                          break
                        default:
                          bgColor = "bg-muted"
                      }

                      return (
                        <div
                          key={`day-${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm ${bgColor}`}
                          title={`${day.count} contributions on ${day.date}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-end items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="w-2 h-2 rounded-sm bg-muted"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-100 dark:bg-emerald-950"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-300 dark:bg-emerald-800"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-500 dark:bg-emerald-600"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-700 dark:bg-emerald-400"></div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Note about data limitations */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>GitHub API Limitations</AlertTitle>
            <AlertDescription>
              GitHub's public API only provides the most recent 90 days of activity. For a complete contribution
              history, GitHub authentication is required. Streak data is calculated based on available events.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}

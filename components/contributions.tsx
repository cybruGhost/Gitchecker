"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface ContributionsProps {
  username: string
}

export function Contributions({ username }: ContributionsProps) {
  const [loading, setLoading] = useState(true)
  const [contributionData, setContributionData] = useState<any>(null)

  useEffect(() => {
    // In a real app, we would fetch actual contribution data
    // For this demo, we'll create more realistic mock data
    const generateContributionData = () => {
      setLoading(true)

      // Create a more realistic contribution pattern
      // Last 52 weeks (1 year) of data
      const weeks = []
      const now = new Date()
      const date = new Date(now)
      date.setDate(date.getDate() - ((date.getDay() + 1) % 7)) // Start from the beginning of the week

      // Generate last 52 weeks
      for (let w = 0; w < 52; w++) {
        const week = []
        for (let d = 0; d < 7; d++) {
          // Create a pattern where weekdays have more contributions than weekends
          // and recent weeks have more contributions than older weeks
          const dayOfWeek = d
          const weekAge = w

          // Base level - more recent weeks have higher base level
          let level = Math.max(0, Math.floor(4 * (1 - weekAge / 52) - Math.random()))

          // Weekdays (1-5) have higher contribution probability
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            level = Math.min(4, level + Math.floor(Math.random() * 3))
          }

          // Add some randomness for realism
          if (Math.random() > 0.7) {
            level = Math.min(4, level + 1)
          }

          // Calculate the date for this cell
          const cellDate = new Date(date)
          cellDate.setDate(cellDate.getDate() - ((52 - w) * 7 + (6 - d)))

          week.push({
            date: cellDate.toISOString().split("T")[0],
            level,
            count: level * Math.floor(Math.random() * 5 + 1), // Random count based on level
          })
        }
        weeks.push(week)
      }

      setContributionData({
        weeks,
        totalContributions: weeks.flat().reduce((sum, day) => sum + day.count, 0),
      })

      setLoading(false)
    }

    generateContributionData()
  }, [username])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution Activity</CardTitle>
        <CardDescription>View contribution history and activity patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Contribution summary */}
              <div className="text-center">
                <p className="text-2xl font-bold">{contributionData.totalContributions}</p>
                <p className="text-sm text-muted-foreground">contributions in the last year</p>
              </div>

              {/* Contribution calendar */}
              <div>
                <h3 className="text-sm font-medium mb-2">Contribution Calendar</h3>
                <div className="border rounded-lg p-4 overflow-x-auto">
                  <div className="flex gap-1 min-w-[750px]">
                    {contributionData.weeks.map((week: any[], weekIndex: number) => (
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

              {/* Activity timeline - more realistic data */}
              <div>
                <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    {
                      type: "commit",
                      repo: "user/project-name",
                      branch: "main",
                      count: 3,
                      time: "2 days ago",
                    },
                    {
                      type: "pull-request",
                      repo: "user/project-name",
                      number: 42,
                      title: "Add new feature",
                      time: "3 days ago",
                    },
                    {
                      type: "issue",
                      repo: "user/another-project",
                      number: 37,
                      title: "Fix bug in authentication",
                      time: "5 days ago",
                    },
                    {
                      type: "commit",
                      repo: "organization/shared-lib",
                      branch: "feature/new-api",
                      count: 5,
                      time: "1 week ago",
                    },
                    {
                      type: "pull-request",
                      repo: "organization/shared-lib",
                      number: 128,
                      title: "Update documentation",
                      time: "1 week ago",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                      <div className="flex-1">
                        {activity.type === "commit" && (
                          <p className="text-sm">
                            Pushed {activity.count} commits to <span className="font-medium">{activity.branch}</span> in{" "}
                            <span className="font-medium">{activity.repo}</span>
                          </p>
                        )}
                        {activity.type === "pull-request" && (
                          <p className="text-sm">
                            Created pull request <span className="font-medium">#{activity.number}</span>:{" "}
                            <span>{activity.title}</span> in <span className="font-medium">{activity.repo}</span>
                          </p>
                        )}
                        {activity.type === "issue" && (
                          <p className="text-sm">
                            Opened issue <span className="font-medium">#{activity.number}</span>:{" "}
                            <span>{activity.title}</span> in <span className="font-medium">{activity.repo}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

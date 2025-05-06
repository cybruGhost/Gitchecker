"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface LanguageBreakdownProps {
  languages: Record<string, number>
}

export function LanguageBreakdown({ languages }: LanguageBreakdownProps) {
  // Convert languages object to array for chart
  const languageData = Object.entries(languages).map(([name, bytes]) => ({
    name,
    value: bytes,
    percentage: 0, // Will be calculated below
  }))

  // Calculate total bytes
  const totalBytes = languageData.reduce((sum, item) => sum + item.value, 0)

  // Calculate percentages
  languageData.forEach((item) => {
    item.percentage = Math.round((item.value / totalBytes) * 100)
  })

  // Sort by value (descending)
  languageData.sort((a, b) => b.value - a.value)

  // Colors for the chart
  const COLORS = [
    "#3366CC",
    "#DC3912",
    "#FF9900",
    "#109618",
    "#990099",
    "#0099C6",
    "#DD4477",
    "#66AA00",
    "#B82E2E",
    "#316395",
  ]

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Breakdown</CardTitle>
        <CardDescription>Distribution of programming languages in this repository</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(languages).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No language data available for this repository</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatBytes(value)}
                    labelFormatter={(index) => languageData[index].name}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Language Details</h3>
              <div className="space-y-3">
                {languageData.map((lang, index) => (
                  <div key={lang.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{lang.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatBytes(lang.value)} ({lang.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

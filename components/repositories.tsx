"use client"

import { useState } from "react"
import { Code, GitFork, Search, Star, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  full_name: string
  topics: string[]
  fork: boolean
  archived: boolean
  visibility: string
}

interface RepositoriesProps {
  repositories: Repository[]
  username: string
}

export function Repositories({ repositories, username }: RepositoriesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"stars" | "updated" | "name">("stars")
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null)
  const [showForks, setShowForks] = useState(true)
  const [showArchived, setShowArchived] = useState(true)

  // Get unique languages
  const languages = Array.from(new Set(repositories.map((repo) => repo.language).filter(Boolean))) as string[]

  // Filter repositories
  const filteredRepos = repositories.filter((repo) => {
    // Search term filter
    const matchesSearch =
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repo.topics && repo.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase())))

    // Language filter
    const matchesLanguage = !filterLanguage || repo.language === filterLanguage

    // Fork filter
    const matchesFork = showForks || !repo.fork

    // Archived filter
    const matchesArchived = showArchived || !repo.archived

    return matchesSearch && matchesLanguage && matchesFork && matchesArchived
  })

  // Sort repositories
  const sortedRepos = [...filteredRepos].sort((a, b) => {
    switch (sortBy) {
      case "stars":
        return b.stargazers_count - a.stargazers_count
      case "updated":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>Found {repositories.length} public repositories</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search repositories..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortBy("stars")}>
                    Stars
                    {sortBy === "stars" && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("updated")}>
                    Recently Updated
                    {sortBy === "updated" && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>
                    Name
                    {sortBy === "name" && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFilterLanguage(null)}>
                    All Languages
                    {filterLanguage === null && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  {languages.map((lang) => (
                    <DropdownMenuItem key={lang} onClick={() => setFilterLanguage(lang)}>
                      {lang}
                      {filterLanguage === lang && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Show</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setShowForks(!showForks)}>
                    Forks
                    {showForks && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowArchived(!showArchived)}>
                    Archived
                    {showArchived && <span className="ml-auto">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRepos.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No repositories found</p>
          ) : (
            sortedRepos.map((repo) => (
              <div key={repo.id} className="border rounded-lg p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <Link href={`/${username}/${repo.name}`} className="font-medium hover:underline text-lg">
                      {repo.name}
                    </Link>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="h-4 w-4 text-muted-foreground" />
                        <span>{repo.forks_count}</span>
                      </div>
                    </div>
                  </div>
                  {repo.description && <p className="text-sm text-muted-foreground">{repo.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {repo.language && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {repo.language}
                      </Badge>
                    )}
                    {repo.fork && <Badge variant="secondary">Fork</Badge>}
                    {repo.archived && <Badge variant="secondary">Archived</Badge>}
                    <span className="text-xs text-muted-foreground">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {repo.topics.slice(0, 5).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {repo.topics.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{repo.topics.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

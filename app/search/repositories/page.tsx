"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchBar } from "@/components/search-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, GitFork, Star, ArrowLeft, Filter, SortAsc, SortDesc, AlertCircle } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RepositorySearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""

  const [repositories, setRepositories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>("stars")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [language, setLanguage] = useState<string | null>(null)
  const [languages, setLanguages] = useState<string[]>([])

  useEffect(() => {
    if (!query) return

    const fetchRepositories = async () => {
      setLoading(true)
      setError(null)

      try {
        // Build sort parameter
        let sort: string
        const order: string = sortOrder

        switch (sortBy) {
          case "stars":
            sort = "stars"
            break
          case "forks":
            sort = "forks"
            break
          case "updated":
            sort = "updated"
            break
          case "name":
            sort = "name"
            break
          default:
            sort = "stars"
        }

        // Build query string with filters
        let queryString = query
        if (language) {
          queryString += `+language:${language}`
        }

        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(queryString)}&sort=${sort}&order=${order}&page=${page}&per_page=10`,
        )

        if (!response.ok) {
          throw new Error(`Error fetching repositories: ${response.statusText}`)
        }

        const data = await response.json()
        setRepositories(data.items || [])
        setTotalCount(data.total_count || 0)

        // Extract unique languages for filter
        const uniqueLanguages = Array.from(
          new Set(data.items.map((repo: any) => repo.language).filter(Boolean)),
        ) as string[]

        setLanguages(uniqueLanguages)
      } catch (error) {
        console.error("Error searching repositories:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [query, page, sortBy, sortOrder, language])

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value === "all" ? null : value)
    setPage(1) // Reset to first page when changing filters
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button variant="outline" size="sm" onClick={() => router.push("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>

        <SearchBar initialQuery={query} initialType="repositories" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Repository Search Results</CardTitle>
              <CardDescription>
                Found {totalCount.toLocaleString()} repositories for "{query}"
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">Stars</SelectItem>
                  <SelectItem value="forks">Forks</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Language</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleLanguageChange("all")}>
                      All Languages
                      {language === null && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {languages.map((lang) => (
                      <DropdownMenuItem key={lang} onClick={() => handleLanguageChange(lang)}>
                        {lang}
                        {language === lang && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : repositories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No repositories found matching your search criteria
            </div>
          ) : (
            <div className="space-y-4">
              {repositories.map((repo) => (
                <div key={repo.id} className="border rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <Link href={`/${repo.full_name}`} className="font-medium hover:underline text-lg">
                        {repo.full_name}
                      </Link>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>{repo.stargazers_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-4 w-4 text-muted-foreground" />
                          <span>{repo.forks_count.toLocaleString()}</span>
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
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {repo.topics.slice(0, 5).map((topic: string) => (
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
              ))}

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Page {page}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={repositories.length < 10}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

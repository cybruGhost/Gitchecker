"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, User, Book, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SearchBarProps {
  initialQuery?: string
  initialType?: "users" | "repositories"
}

export function SearchBar({ initialQuery = "", initialType = "users" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState<"users" | "repositories">(initialType)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (search: string) => {
    const updatedSearches = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5)
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const endpoint =
          searchType === "users"
            ? `https://api.github.com/search/users?q=${query}&per_page=5`
            : `https://api.github.com/search/repositories?q=${query}&per_page=5`

        const response = await fetch(endpoint)
        if (!response.ok) throw new Error("Failed to fetch suggestions")

        const data = await response.json()
        setSuggestions(data.items || [])
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, searchType])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    saveRecentSearch(query)
    setOpen(false)

    if (searchType === "users") {
      router.push(`/${query}`)
    } else {
      router.push(`/search/repositories?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    if (searchType === "users") {
      saveRecentSearch(suggestion.login)
      router.push(`/${suggestion.login}`)
    } else {
      saveRecentSearch(suggestion.full_name)
      router.push(`/${suggestion.full_name}`)
    }
    setOpen(false)
  }

  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    saveRecentSearch(search)

    if (searchType === "users") {
      router.push(`/${search}`)
    } else {
      router.push(`/search/repositories?q=${encodeURIComponent(search)}`)
    }
    setOpen(false)
  }

  const clearSearch = () => {
    setQuery("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue={searchType} onValueChange={(value) => setSearchType(value as "users" | "repositories")}>
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="repositories" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              Repositories
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="mt-0">
          <div className="relative w-full">
            <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search GitHub users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 pr-10"
                  onClick={() => setOpen(true)}
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                onClick={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    Search
                  </span>
                )}
              </Button>
            </form>

            {open && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
                <div className="p-0 w-full">
                  <div className="max-h-[300px] overflow-y-auto">
                    {query.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
                        {isLoading ? (
                          <div className="flex justify-center p-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div className="space-y-1">
                            {suggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={suggestion.avatar_url || "/placeholder.svg"}
                                    alt={suggestion.login}
                                  />
                                  <AvatarFallback>{suggestion.login?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span>{suggestion.login}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-2 text-muted-foreground">No users found</div>
                        )}
                      </div>
                    )}

                    {recentSearches.length > 0 && (
                      <div className="p-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Recent Searches</div>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <div
                              key={index}
                              onClick={() => handleRecentSearchClick(search)}
                              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                            >
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <span>{search}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="repositories" className="mt-0">
          <div className="relative w-full">
            <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search GitHub repositories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 pr-10"
                  onClick={() => setOpen(true)}
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                  </Button>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                onClick={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    Search
                  </span>
                )}
              </Button>
            </form>

            {open && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
                <div className="p-0 w-full">
                  <div className="max-h-[300px] overflow-y-auto">
                    {query.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
                        {isLoading ? (
                          <div className="flex justify-center p-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div className="space-y-1">
                            {suggestions.map((repo) => (
                              <div
                                key={repo.id}
                                onClick={() => handleSuggestionClick(repo)}
                                className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                              >
                                <Book className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span>{repo.full_name}</span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {repo.language && <span>{repo.language}</span>}
                                    <span>⭐ {repo.stargazers_count}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-2 text-muted-foreground">No repositories found</div>
                        )}
                      </div>
                    )}

                    {recentSearches.length > 0 && (
                      <div className="p-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-2">Recent Searches</div>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <div
                              key={index}
                              onClick={() => handleRecentSearchClick(search)}
                              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                            >
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <span>{search}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

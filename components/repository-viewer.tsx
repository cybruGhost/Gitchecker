"use client"

import { useState, useEffect } from "react"
import { FileText, Folder, Download, ExternalLink, ArrowLeft, Code, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import apiCache from "@/lib/api-cache"

interface RepositoryViewerProps {
  username: string
  repo: string
  defaultReadme?: {
    content: string
    path: string
    html_url: string
  } | null
}

export function RepositoryViewer({ username, repo, defaultReadme }: RepositoryViewerProps) {
  const [path, setPath] = useState("")
  const [contents, setContents] = useState<any[]>([])
  const [fileContent, setFileContent] = useState<string | null>(defaultReadme?.content || null)
  const [fileName, setFileName] = useState<string | null>(defaultReadme?.path || null)
  const [fileUrl, setFileUrl] = useState<string | null>(defaultReadme?.html_url || null)
  const [loading, setLoading] = useState(!defaultReadme)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>(defaultReadme ? "readme" : "files")
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered")
  const [error, setError] = useState<string | null>(null)
  const [repoOwner, setRepoOwner] = useState<any | null>(null)
  const [ownerRepos, setOwnerRepos] = useState<any[]>([])
  const [loadingOwner, setLoadingOwner] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchContents("")
    fetchRepoOwner()
  }, [username, repo])

  const fetchRepoOwner = async () => {
    setLoadingOwner(true)
    try {
      // Fetch the repository owner's details with caching
      const ownerData = await apiCache.fetchWithCache(`https://api.github.com/users/${username}`)
      setRepoOwner(ownerData)

      // Fetch the owner's repositories with caching
      const reposData = await apiCache.fetchWithCache(
        `https://api.github.com/users/${username}/repos?per_page=5&sort=updated`,
      )

      // Filter out the current repository
      const otherRepos = reposData.filter((r: any) => r.name !== repo)
      setOwnerRepos(otherRepos.slice(0, 4)) // Limit to 4 other repos
    } catch (error) {
      console.error("Error fetching repository owner:", error)
    } finally {
      setLoadingOwner(false)
    }
  }

  const fetchContents = async (contentPath: string) => {
    setLoading(true)
    setError(null)
    setPath(contentPath)

    if (contentPath === "" && defaultReadme) {
      setFileContent(defaultReadme.content)
      setFileName(defaultReadme.path)
      setFileUrl(defaultReadme.html_url)
    } else {
      setFileContent(null)
      setFileName(null)
      setFileUrl(null)
    }

    try {
      const apiPath = contentPath ? `${contentPath}` : ""
      const data = await apiCache.fetchWithCache(`https://api.github.com/repos/${username}/${repo}/contents/${apiPath}`)

      if (Array.isArray(data)) {
        // Directory contents
        setContents(data)

        // Update breadcrumbs
        if (contentPath === "") {
          setBreadcrumbs([])
        } else {
          const parts = contentPath.split("/").filter(Boolean)
          setBreadcrumbs(parts)
        }
      } else {
        // Single file
        if (data.encoding === "base64" && data.content) {
          const decodedContent = atob(data.content)
          setFileContent(decodedContent)
          setFileName(data.name)
          setFileUrl(data.html_url)
          setActiveTab("file")
        }
      }
    } catch (error) {
      console.error("Error fetching repository contents:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setContents([])
    } finally {
      setLoading(false)
    }
  }

  const navigateToPath = (index: number) => {
    if (index === -1) {
      fetchContents("")
    } else {
      const newPath = breadcrumbs.slice(0, index + 1).join("/")
      fetchContents(newPath)
    }
  }

  const handleItemClick = (item: any) => {
    if (item.type === "dir") {
      fetchContents(item.path)
    } else {
      // For files, fetch the content
      setLoading(true)
      fetch(item.download_url)
        .then((response) => response.text())
        .then((content) => {
          setFileContent(content)
          setFileName(item.name)
          setFileUrl(item.html_url)
          setActiveTab("file")
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching file content:", error)
          setError(error instanceof Error ? error.message : "An unknown error occurred")
          setLoading(false)
        })
    }
  }

  // Function to determine if content is an image
  const isImage = (filename: string | null) => {
    if (!filename) return false
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"]
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  // Function to determine if content is a markdown file
  const isMarkdown = (filename: string | null) => {
    if (!filename) return false
    return filename.toLowerCase().endsWith(".md") || filename.toLowerCase().endsWith(".markdown")
  }

  // Function to determine if content is code
  const isCode = (filename: string | null) => {
    if (!filename) return false
    const codeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".html",
      ".css",
      ".scss",
      ".json",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
      ".rb",
      ".php",
      ".swift",
      ".kt",
      ".rs",
    ]
    return codeExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
  }

  // Function to render file content based on type
  const renderFileContent = () => {
    if (!fileName || !fileContent) return null

    if (isImage(fileName)) {
      return (
        <div className="flex justify-center p-4">
          <img
            src={`https://raw.githubusercontent.com/${username}/${repo}/master/${path ? `${path}/` : ""}${fileName}`}
            alt={fileName}
            className="max-w-full max-h-[500px] object-contain"
          />
        </div>
      )
    }

    if (isMarkdown(fileName) && viewMode === "rendered") {
      return (
        <div className="border rounded-lg p-4 overflow-x-auto prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{fileContent}</ReactMarkdown>
        </div>
      )
    }

    // Default text rendering (including code and raw markdown)
    return (
      <div className="border rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm whitespace-pre-wrap font-mono">{fileContent}</pre>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Repository owner card */}
      {loadingOwner ? (
        <Skeleton className="h-[100px] w-full" />
      ) : (
        repoOwner && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={repoOwner.avatar_url || "/placeholder.svg"} alt={repoOwner.login} />
                  <AvatarFallback>{repoOwner.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    <Link href={`/${repoOwner.login}`} className="hover:underline">
                      {repoOwner.name || repoOwner.login}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">{repoOwner.bio || `@${repoOwner.login}`}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={repoOwner.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    View Profile
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <CardTitle>Repository Explorer</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://github.com/${username}/${repo}/archive/refs/heads/master.zip`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4 mr-1" />
                Download ZIP
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://github.com/${username}/${repo}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                View on GitHub
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Breadcrumb navigation */}
              <div className="flex items-center flex-wrap gap-1 text-sm">
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => navigateToPath(-1)}>
                  Root
                </Button>
                {breadcrumbs.map((part, index) => (
                  <div key={index} className="flex items-center">
                    <span className="mx-1 text-muted-foreground">/</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => navigateToPath(index)}>
                      {part}
                    </Button>
                  </div>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  {defaultReadme && <TabsTrigger value="readme">README</TabsTrigger>}
                  {fileContent && fileName !== defaultReadme?.path && (
                    <TabsTrigger value="file">{fileName}</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="files" className="pt-4">
                  {contents.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {contents
                        .sort((a, b) => {
                          // Directories first, then files
                          if (a.type === "dir" && b.type !== "dir") return -1
                          if (a.type !== "dir" && b.type === "dir") return 1
                          // Alphabetical within each type
                          return a.name.localeCompare(b.name)
                        })
                        .map((item) => (
                          <div
                            key={item.sha}
                            className="p-3 flex items-center gap-2 hover:bg-muted cursor-pointer"
                            onClick={() => handleItemClick(item)}
                          >
                            {item.type === "dir" ? (
                              <Folder className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{item.name}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {error ? "Failed to load directory contents" : "This directory is empty"}
                    </div>
                  )}
                </TabsContent>

                {defaultReadme && (
                  <TabsContent value="readme" className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">{defaultReadme.path}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === "rendered" ? "raw" : "rendered")}
                        >
                          {viewMode === "rendered" ? (
                            <>
                              <Code className="h-3 w-3 mr-1" /> View Raw
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" /> View Rendered
                            </>
                          )}
                        </Button>
                        {defaultReadme.html_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={defaultReadme.html_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on GitHub
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {viewMode === "rendered" ? (
                      <div className="border rounded-lg p-4 overflow-x-auto prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{defaultReadme.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">{defaultReadme.content}</pre>
                      </div>
                    )}
                  </TabsContent>
                )}

                {fileContent && fileName !== defaultReadme?.path && (
                  <TabsContent value="file" className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">{fileName}</h3>
                      <div className="flex gap-2">
                        {isMarkdown(fileName) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === "rendered" ? "raw" : "rendered")}
                          >
                            {viewMode === "rendered" ? (
                              <>
                                <Code className="h-3 w-3 mr-1" /> View Raw
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" /> View Rendered
                              </>
                            )}
                          </Button>
                        )}
                        {fileUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on GitHub
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {renderFileContent()}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other repositories by the same owner */}
      {ownerRepos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>More repositories by {username}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerRepos.map((otherRepo) => (
                <div key={otherRepo.id} className="border rounded-lg p-3 hover:bg-muted/50">
                  <Link href={`/${username}/${otherRepo.name}`} className="block">
                    <h3 className="font-medium hover:underline">{otherRepo.name}</h3>
                    {otherRepo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{otherRepo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {otherRepo.language && <span>{otherRepo.language}</span>}
                      <span>⭐ {otherRepo.stargazers_count}</span>
                      <span>🍴 {otherRepo.forks_count}</span>
                      <span>Updated {new Date(otherRepo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://github.com/${username}?tab=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  View all repositories
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

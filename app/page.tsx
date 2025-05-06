import { SearchBar } from "@/components/search-bar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GitHub Insights Dashboard</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore GitHub users, repositories, and analytics with powerful search and visualization tools
          </p>

          <SearchBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-card border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-3">User Profiles</h2>
            <p className="text-muted-foreground">
              Search for GitHub users and explore their profiles, repositories, and contribution history
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-3">Repository Explorer</h2>
            <p className="text-muted-foreground">
              Browse repositories, view code, and explore file structures with syntax highlighting
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-3">Contribution Tracking</h2>
            <p className="text-muted-foreground">
              Track contribution streaks, view activity patterns, and analyze coding habits
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

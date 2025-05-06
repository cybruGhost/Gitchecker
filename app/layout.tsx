import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, AlertCircle } from "lucide-react"
import Link from "next/link"
import { HelpDialog } from "@/components/help-dialog"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GitHub Insights Dashboard",
  description: "Explore GitHub users, repositories, and analytics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                  <Github className="h-5 w-5" />
                  <span>GitHub Insights</span>
                </Link>
                <div className="flex items-center gap-2">
                  <HelpDialog />
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p>
                    GitHub Insights Dashboard - Built with Next.js and shadcn/ui by{" "}
                    <a
                      href="https://github.com/cybrughost"
                      className="underline hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      cybrughost
                    </a>
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://github.com/cybrughost/gitchecker/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Report Issue
                    </a>
                  </Button>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

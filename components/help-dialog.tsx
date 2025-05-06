"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, HelpCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function HelpDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>GitHub Dashboard Help</DialogTitle>
          <DialogDescription>Information about the GitHub Dashboard and its limitations</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <section>
            <h3 className="font-medium text-lg mb-2">About This Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              This dashboard provides insights into GitHub users, repositories, and activity using the GitHub public
              API. It allows you to explore profiles, view repositories, and analyze contribution patterns.
            </p>
          </section>

          <section>
            <h3 className="font-medium text-lg mb-2">GitHub API Rate Limits</h3>
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-1">🔹 Unauthenticated Requests</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Limit: 60 requests per hour per IP address</li>
                  <li>• Refresh: Every hour</li>
                  <li>• If you exceed this, GitHub blocks further requests until the hour resets</li>
                </ul>
              </div>

              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-1">🔐 Authenticated Requests (with a GitHub token)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Limit: 5,000 requests per hour</li>
                  <li>• Refresh: Every hour</li>
                  <li>• Much safer for apps; avoids hitting the low unauthenticated limit</li>
                </ul>
              </div>
            </div>
          </section>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rate Limit Warning</AlertTitle>
            <AlertDescription>
              This dashboard currently uses unauthenticated requests, which are limited to 60 per hour. If you encounter
              errors, you may have hit this limit. Wait an hour or try again later.
            </AlertDescription>
          </Alert>

          <section>
            <h3 className="font-medium text-lg mb-2">Data Limitations</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Contribution Data:</span> GitHub's public API provides
                limited contribution data. For complete history, GitHub authentication is required.
              </li>
              <li>
                <span className="font-medium text-foreground">Private Repositories:</span> Private repositories are not
                accessible without authentication.
              </li>
              <li>
                <span className="font-medium text-foreground">Streak Calculation:</span> Streak data is calculated based
                on available event data, which may be incomplete due to API limitations.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium text-lg mb-2">Future Improvements</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• GitHub authentication for higher rate limits and access to private data</li>
              <li>• Enhanced contribution visualization with more detailed statistics</li>
              <li>• Repository comparison features</li>
              <li>• Code syntax highlighting for better code viewing</li>
              <li>• Organization dashboard for exploring GitHub organizations</li>
            </ul>
          </section>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <a
              href="https://github.com/cybrughost/gitchecker/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1"
            >
              Report an Issue
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

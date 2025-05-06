import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TrafficProps {
  username: string
}

export function Traffic({ username }: TrafficProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Traffic</CardTitle>
        <CardDescription>View visitors, clones, and referral sources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-lg border p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Repository traffic data is only available to repository owners
              </p>
              <p className="text-sm text-muted-foreground">
                GitHub requires authentication with appropriate permissions to access traffic data
              </p>
            </div>
          </div>

          <Tabs defaultValue="visitors">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visitors">Visitors</TabsTrigger>
              <TabsTrigger value="clones">Clones</TabsTrigger>
              <TabsTrigger value="referrers">Referrers</TabsTrigger>
            </TabsList>
            <TabsContent value="visitors" className="pt-4">
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Visitor data requires repository owner access</p>
              </div>
            </TabsContent>
            <TabsContent value="clones" className="pt-4">
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Clone data requires repository owner access</p>
              </div>
            </TabsContent>
            <TabsContent value="referrers" className="pt-4">
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Referrer data requires repository owner access</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

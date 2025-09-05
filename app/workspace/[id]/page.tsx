import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart3, Calendar, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface WorkspacePageProps {
  params: {
    id: string
  }
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const workspace = {
    id: params.id,
    name: "My Media Planning Workspace",
    description: "AI-powered media planning and campaign management",
    owner_id: "mock-user-id",
  }

  const campaigns = [
    {
      id: "1",
      name: "Summer Product Launch",
      description: "AI-generated campaign for new product launch targeting millennials",
      status: "active",
      type: "Product Launch",
      target_audience: "Millennials 25-35",
      budget: "$5,000",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Brand Awareness Campaign",
      description: "Multi-platform brand awareness campaign with AI-optimized content",
      status: "draft",
      type: "Brand Awareness",
      target_audience: "Gen Z 18-25",
      budget: "$3,000",
      created_at: new Date().toISOString(),
    },
  ]

  const mockUser = {
    email: "user@example.com",
  }

  const isOwner = true

  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MP</span>
                </div>
                <div>
                  <h1 className="font-semibold text-lg">{workspace.name}</h1>
                  <p className="text-sm text-muted-foreground">{workspace.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/workspace/${workspace.id}/settings`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workspace/${workspace.id}/calendar`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workspace/${workspace.id}/social`}>
                  <Users className="w-4 h-4 mr-2" />
                  Social Media
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]"
                asChild
              >
                <Link href={`/workspace/${workspace.id}/campaigns/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Campaigns</h2>
            <Button
              className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]"
              asChild
            >
              <Link href={`/workspace/${workspace.id}/campaigns/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{campaign.name}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : campaign.status === "paused"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {campaign.status || "draft"}
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {campaign.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                    <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      {campaign.type && (
                        <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">{campaign.type}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {campaign.target_audience && <p>Target: {campaign.target_audience}</p>}
                      {campaign.budget && <p>Budget: {campaign.budget}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/workspace/${workspace.id}/campaigns/${campaign.id}/editor`}>Open Editor</Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/workspace/${workspace.id}/campaigns/${campaign.id}/chat`}>AI Chat</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to this workspace</CardDescription>
              </div>
              {isOwner && (
                <Button variant="outline" asChild>
                  <Link href={`/workspace/${workspace.id}/team`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">You (Owner)</p>
                  <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Owner</span>
              </div>

              <p className="text-center text-muted-foreground py-4">
                No additional members yet. Invite team members to collaborate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart3, Calendar, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"
// import { WorkspaceSelector } from "@/components/workspace-selector"

interface WorkspacePageProps {
  params: {
    id: string
  }
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select(`
      *,
      workspace_members(
        id,
        role,
        user_id
      )
    `)
    .eq("id", params.id)
    .or(`owner_id.eq.${user.user.id},workspace_members.user_id.eq.${user.user.id}`)
    .single()

  if (!workspace) {
    redirect("/workspace/new")
  }

  // Get campaigns for this workspace
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })

  const isOwner = workspace.owner_id === user.user.id

  return (
    <div className="min-h-screen bg-background">
      {/* Workspace Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
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
                <Link href="/auth/signout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
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
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(workspace.workspace_members?.length || 0) + 1}</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Campaigns</h2>
            <Button
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
              asChild
            >
              <Link href={`/workspace/${workspace.id}/campaigns/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          </div>

          {campaigns && campaigns.length > 0 ? (
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
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/workspace/${workspace.id}/campaigns/${campaign.id}/editor`}>Open Editor</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI-powered campaign to start planning your media strategy.
                </p>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  asChild
                >
                  <Link href={`/workspace/${workspace.id}/campaigns/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
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
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
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
                  <p className="text-sm text-muted-foreground">{user.user.email}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Owner</span>
              </div>

              {/* Members */}
              {workspace.workspace_members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Team Member</p>
                    <p className="text-sm text-muted-foreground">User ID: {member.user_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        member.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {member.role}
                    </span>
                    {isOwner && (
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {(!workspace.workspace_members || workspace.workspace_members.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  No additional members yet. Invite team members to collaborate.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, Calendar, Users, BarChart3, Settings } from "lucide-react"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user workspaces (owned + member of)
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select(`
      *,
      workspace_members(role, user_id)
    `)
    .or(`owner_id.eq.${data.user.id},workspace_members.user_id.eq.${data.user.id}`)
    .order("created_at", { ascending: false })

  // Get campaigns count
  const { count: campaignsCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .in("workspace_id", workspaces?.map((w) => w.id) || [])

  // Get scheduled content count
  const { count: scheduledCount } = await supabase
    .from("content_pieces")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")
    .in("campaign_id", []) // Will be populated when campaigns exist

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <span className="font-bold text-xl text-foreground">Ireal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {profile?.full_name || data.user.email}</span>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">Manage your media plans and campaigns with AI-powered tools.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workspaces?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignsCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  if (!workspaces || workspaces.length === 0) return 1 // Just the current user

                  const totalMembers = workspaces.reduce((acc, workspace) => {
                    const members = workspace.workspace_members
                    const memberCount = Array.isArray(members) ? members.length : 0
                    return acc + memberCount
                  }, 0)

                  return totalMembers + 1 // +1 for the current user
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workspaces Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Workspaces</h2>
            <CreateWorkspaceDialog userId={data.user.id} />
          </div>

          {workspaces && workspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => {
                const isOwner = workspace.owner_id === data.user.id
                const memberRole =
                  Array.isArray(workspace.workspace_members) && workspace.workspace_members.length > 0
                    ? workspace.workspace_members.find((m) => m.user_id === data.user.id)?.role
                    : null
                const role = isOwner ? "owner" : memberRole || "member"

                return (
                  <Card key={workspace.id} className="hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <Folder className="w-5 h-5 text-blue-600" />
                            {workspace.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {workspace.description || "No description provided"}
                          </CardDescription>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            asChild
                          >
                            <Link href={`/workspace/${workspace.id}/settings`}>
                              <Settings className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="capitalize">{role}</span>
                            <span>•</span>
                            <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/workspace/${workspace.id}`}>Open</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workspace to start managing your media plans.
                </p>
                <CreateWorkspaceDialog userId={data.user.id} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to set up your first media plan campaign.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  workspaces && workspaces.length > 0
                    ? "bg-green-50 border border-green-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    workspaces && workspaces.length > 0 ? "bg-green-600" : "bg-blue-600"
                  }`}
                >
                  {workspaces && workspaces.length > 0 ? "✓" : "1"}
                </div>
                <span>Create your first workspace</span>
              </div>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  workspaces && workspaces.length > 0 ? "bg-blue-50 border border-blue-200" : "bg-muted/30 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    workspaces && workspaces.length > 0 ? "bg-blue-600" : "bg-gray-400"
                  }`}
                >
                  2
                </div>
                <span>Set up your first campaign with AI assistance</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg opacity-60">
                <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span>Generate content and schedule posts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

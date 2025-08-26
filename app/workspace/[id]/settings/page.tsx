import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface WorkspaceSettingsPageProps {
  params: {
    id: string
  }
}

export default async function WorkspaceSettingsPage({ params }: WorkspaceSettingsPageProps) {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  // Get workspace details and verify ownership
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", user.user.id)
    .single()

  if (!workspace) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Settings Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/workspace/${workspace.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workspace
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="font-semibold text-lg">Workspace Settings</h1>
              <p className="text-sm text-muted-foreground">{workspace.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your workspace name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Workspace Name</label>
                <p className="text-sm text-muted-foreground mb-2">This is how your workspace appears to team members</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={workspace.name}
                    className="flex-1 px-3 py-2 border border-input rounded-md"
                  />
                  <Button>Save</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mb-2">Optional description for this workspace</p>
                <div className="flex gap-2">
                  <textarea
                    defaultValue={workspace.description || ""}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-input rounded-md resize-none"
                  />
                  <Button>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Management */}
          <Card>
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>Manage team members and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Invite New Member</Button>
                <p className="text-sm text-muted-foreground">
                  Team member management will be available once you invite your first member.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Workspace</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this workspace and all its campaigns, content, and data.
                    </p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

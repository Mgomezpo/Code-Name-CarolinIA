import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function WorkspacePage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  let { data: workspace } = await supabase.from("workspaces").select("*").eq("owner_id", user.id).single()

  // If no workspace exists, create one
  if (!workspace) {
    const { data: newWorkspace, error: createError } = await supabase
      .from("workspaces")
      .insert({
        name: "My Workspace",
        owner_id: user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating workspace:", createError)
      redirect("/auth/login?error=workspace_creation_failed")
    }

    workspace = newWorkspace
  }

  // Redirect to the user's workspace
  redirect(`/workspace/${workspace.id}`)
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: connections, error } = await supabase
      .from("social_media_connections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
    }

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("Error fetching connections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, platform, accountName, accountId, accessToken, refreshToken, expiresAt } = await request.json()

    if (!workspaceId || !platform || !accountName || !accountId || !accessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: connection, error } = await supabase
      .from("social_media_connections")
      .insert({
        workspace_id: workspaceId,
        platform,
        account_name: accountName,
        account_id: accountId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create connection" }, { status: 500 })
    }

    return NextResponse.json({ connection })
  } catch (error) {
    console.error("Error creating connection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

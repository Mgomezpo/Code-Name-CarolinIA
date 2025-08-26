import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { contentPieceId, connectionId } = await request.json()

    if (!contentPieceId || !connectionId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get content piece and connection details
    const { data: contentPiece, error: contentError } = await supabase
      .from("content_pieces")
      .select(`
        *,
        campaigns(
          name,
          workspace_id
        )
      `)
      .eq("id", contentPieceId)
      .single()

    const { data: connection, error: connectionError } = await supabase
      .from("social_media_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("is_active", true)
      .single()

    if (contentError || connectionError || !contentPiece || !connection) {
      return NextResponse.json({ error: "Content or connection not found" }, { status: 404 })
    }

    // Create publishing log entry
    const { data: publishingLog, error: logError } = await supabase
      .from("publishing_logs")
      .insert({
        content_piece_id: contentPieceId,
        connection_id: connectionId,
        status: "pending",
      })
      .select()
      .single()

    if (logError) {
      return NextResponse.json({ error: "Failed to create publishing log" }, { status: 500 })
    }

    // Simulate publishing to different platforms
    let publishResult
    try {
      publishResult = await publishToSocialMedia(connection, contentPiece)

      // Update publishing log with success
      await supabase
        .from("publishing_logs")
        .update({
          status: "published",
          platform_post_id: publishResult.postId,
          published_at: new Date().toISOString(),
        })
        .eq("id", publishingLog.id)

      // Update content piece status
      await supabase.from("content_pieces").update({ status: "published" }).eq("id", contentPieceId)
    } catch (publishError: any) {
      // Update publishing log with error
      await supabase
        .from("publishing_logs")
        .update({
          status: "failed",
          error_message: publishError.message,
        })
        .eq("id", publishingLog.id)

      return NextResponse.json({ error: publishError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      postId: publishResult.postId,
      publishingLogId: publishingLog.id,
    })
  } catch (error: any) {
    console.error("Publishing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function publishToSocialMedia(connection: any, contentPiece: any) {
  // This is a mock implementation. In a real app, you would integrate with actual social media APIs
  const { platform, access_token, account_name } = connection
  const { title, content, content_type } = contentPiece

  console.log(`Publishing to ${platform} for account ${account_name}`)
  console.log(`Content: ${title} - ${content}`)

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock different platform behaviors
  switch (platform) {
    case "instagram":
      if (content_type === "story" && Math.random() > 0.8) {
        throw new Error("Instagram Story upload failed: Invalid media format")
      }
      return { postId: `ig_${Date.now()}` }

    case "facebook":
      if (content.length > 2000) {
        throw new Error("Facebook post too long: Maximum 2000 characters")
      }
      return { postId: `fb_${Date.now()}` }

    case "linkedin":
      if (content_type === "story") {
        throw new Error("LinkedIn does not support story format")
      }
      return { postId: `li_${Date.now()}` }

    default:
      return { postId: `${platform}_${Date.now()}` }
  }
}

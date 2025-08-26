-- Create social media connections table
CREATE TABLE IF NOT EXISTS public.social_media_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'tiktok')),
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, platform, account_id)
);

-- Create publishing logs table
CREATE TABLE IF NOT EXISTS public.publishing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_piece_id UUID NOT NULL REFERENCES public.content_pieces(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.social_media_connections(id) ON DELETE CASCADE,
  platform_post_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'scheduled')),
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.social_media_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social media connections
CREATE POLICY "social_connections_select_workspace_member" ON public.social_media_connections FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

CREATE POLICY "social_connections_insert_workspace_member" ON public.social_media_connections FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

CREATE POLICY "social_connections_update_workspace_member" ON public.social_media_connections FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

CREATE POLICY "social_connections_delete_workspace_member" ON public.social_media_connections FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

-- RLS Policies for publishing logs
CREATE POLICY "publishing_logs_select_workspace_member" ON public.publishing_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.content_pieces cp
      JOIN public.campaigns c ON cp.campaign_id = c.id
      JOIN public.workspaces w ON c.workspace_id = w.id
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE cp.id = content_piece_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

CREATE POLICY "publishing_logs_insert_workspace_member" ON public.publishing_logs FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_pieces cp
      JOIN public.campaigns c ON cp.campaign_id = c.id
      JOIN public.workspaces w ON c.workspace_id = w.id
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE cp.id = content_piece_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

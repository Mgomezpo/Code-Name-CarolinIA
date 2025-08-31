-- Executing the complete database schema to create all missing tables
-- Execute this script to create all database tables
-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace members table for collaboration
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  objectives TEXT[],
  budget DECIMAL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content pieces table
CREATE TABLE IF NOT EXISTS public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'reel', 'video', 'image', 'carousel')),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'tiktok')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;

-- Helper functions to check workspace membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = is_workspace_member.workspace_id
      AND workspace_members.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(workspace_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = is_workspace_owner.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'owner'
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for workspaces
CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT
  USING (
    is_workspace_owner(id) OR
    is_workspace_member(id)
  );
CREATE POLICY "workspaces_insert_own" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "workspaces_update_owner" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "workspaces_delete_owner" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for workspace members
CREATE POLICY "workspace_members_select_member" ON public.workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_workspace_owner(workspace_id)
  );
CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  );
CREATE POLICY "workspace_members_update_owner" ON public.workspace_members FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  );
CREATE POLICY "workspace_members_delete_owner" ON public.workspace_members FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  );

-- RLS Policies for campaigns
CREATE POLICY "campaigns_select_workspace_member" ON public.campaigns FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
CREATE POLICY "campaigns_insert_workspace_member" ON public.campaigns FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
CREATE POLICY "campaigns_update_workspace_member" ON public.campaigns FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
CREATE POLICY "campaigns_delete_workspace_member" ON public.campaigns FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w 
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

-- RLS Policies for content pieces
CREATE POLICY "content_pieces_select_campaign_member" ON public.content_pieces FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.workspaces w ON c.workspace_id = w.id
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE c.id = campaign_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
CREATE POLICY "content_pieces_insert_campaign_member" ON public.content_pieces FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.workspaces w ON c.workspace_id = w.id
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE c.id = campaign_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
CREATE POLICY "content_pieces_update_campaign_member" ON public.content_pieces FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.workspaces w ON c.workspace_id = w.id
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE c.id = campaign_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );
CREATE POLICY "content_pieces_delete_campaign_member" ON public.content_pieces FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.workspaces w ON c.workspace_id = w.id
      LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id 
      WHERE c.id = campaign_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    )
  );

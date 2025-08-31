-- Remove all existing RLS policies that cause infinite recursion
-- and create simple, direct policies

-- Disable RLS temporarily to avoid conflicts during policy changes
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "workspaces_select_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_insert_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete_owner" ON public.workspaces;

DROP POLICY IF EXISTS "workspace_members_select_owner" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_member" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_owner" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_owner" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_owner" ON public.workspace_members;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create simple, non-circular policies for workspaces
CREATE POLICY "workspaces_select_simple" ON public.workspaces
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "workspaces_insert_simple" ON public.workspaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "workspaces_update_simple" ON public.workspaces
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete_simple" ON public.workspaces
    FOR DELETE USING (owner_id = auth.uid());

-- Create simple, non-circular policies for workspace_members
CREATE POLICY "workspace_members_select_simple" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "workspace_members_insert_simple" ON public.workspace_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_members_update_simple" ON public.workspace_members
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "workspace_members_delete_simple" ON public.workspace_members
    FOR DELETE USING (user_id = auth.uid());

-- Create simple policies for profiles
CREATE POLICY "profiles_select_simple" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_simple" ON public.profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_simple" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Re-enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix infinite recursion in RLS policies by removing circular dependencies

-- Drop all existing policies that cause circular references
DROP POLICY IF EXISTS "workspaces_select_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_members_select_owner" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select_member" ON public.workspace_members;

-- Create simple, non-circular policies for workspaces
CREATE POLICY "workspaces_select_policy" ON public.workspaces
    FOR SELECT USING (
        owner_id = auth.uid()
    );

CREATE POLICY "workspaces_insert_policy" ON public.workspaces
    FOR INSERT WITH CHECK (
        owner_id = auth.uid()
    );

CREATE POLICY "workspaces_update_policy" ON public.workspaces
    FOR UPDATE USING (
        owner_id = auth.uid()
    );

CREATE POLICY "workspaces_delete_policy" ON public.workspaces
    FOR DELETE USING (
        owner_id = auth.uid()
    );

-- Create simple, non-circular policies for workspace_members
CREATE POLICY "workspace_members_select_policy" ON public.workspace_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "workspace_members_insert_policy" ON public.workspace_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "workspace_members_update_policy" ON public.workspace_members
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "workspace_members_delete_policy" ON public.workspace_members
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- Create simple policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        id = auth.uid()
    );

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (
        id = auth.uid()
    );

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        id = auth.uid()
    );

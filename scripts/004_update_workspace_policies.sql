-- Update workspace policies to avoid mutual RLS recursion
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_members_select_member" ON public.workspace_members;

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

CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT
  USING (
    is_workspace_owner(id) OR
    is_workspace_member(id)
  );

CREATE POLICY "workspace_members_select_member" ON public.workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_workspace_owner(workspace_id)
  );

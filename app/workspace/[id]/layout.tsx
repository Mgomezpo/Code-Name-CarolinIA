import Sidebar from "@/components/Sidebar"

interface LayoutProps {
  children: React.ReactNode
  params: { id: string }
}

export default function WorkspaceLayout({ children, params }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar workspaceId={params.id} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

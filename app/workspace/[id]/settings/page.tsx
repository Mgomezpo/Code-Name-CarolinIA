interface SettingsPageProps {
  params: { id: string }
}

export default function WorkspaceSettingsPage({ params }: SettingsPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <p className="text-muted-foreground">Ajustes del workspace {params.id}</p>
    </div>
  )
}

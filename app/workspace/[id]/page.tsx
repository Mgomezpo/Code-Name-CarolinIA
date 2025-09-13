interface WorkspacePageProps {
  params: { id: string }
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  void params
  const plans = [
    { id: 1, name: "Plan de ejemplo", description: "Descripción de ejemplo" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plan de mercadeo</h1>
        <button
          className="inline-flex items-center rounded-md border border-border px-4 py-2 bg-transparent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Crear plan
        </button>
      </div>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-muted border border-border rounded-md p-4"
        >
          <h2 className="font-medium">{plan.name}</h2>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        </div>
      ))}
    </div>
  )
}

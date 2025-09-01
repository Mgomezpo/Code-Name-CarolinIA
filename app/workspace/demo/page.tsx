"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DemoWorkspace() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const campaigns = [
    {
      id: 1,
      name: "Summer Product Launch",
      status: "active",
      budget: "$15,000",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      progress: 75,
    },
    {
      id: 2,
      name: "Brand Awareness Q1",
      status: "draft",
      budget: "$8,500",
      startDate: "2024-02-01",
      endDate: "2024-04-30",
      progress: 25,
    },
    {
      id: 3,
      name: "Holiday Campaign",
      status: "completed",
      budget: "$12,000",
      startDate: "2023-11-01",
      endDate: "2023-12-31",
      progress: 100,
    },
  ]

  const contentPieces = [
    {
      id: 1,
      title: "Instagram Post - Product Showcase",
      platform: "Instagram",
      date: "2024-01-20",
      status: "published",
    },
    {
      id: 2,
      title: "LinkedIn Article - Industry Insights",
      platform: "LinkedIn",
      date: "2024-01-22",
      status: "scheduled",
    },
    { id: 3, title: "Facebook Ad - Summer Sale", platform: "Facebook", date: "2024-01-25", status: "draft" },
  ]

  const teamMembers = [
    { id: 1, name: "Ana García", role: "Campaign Manager", email: "ana@company.com" },
    { id: 2, name: "Carlos López", role: "Content Creator", email: "carlos@company.com" },
    { id: 3, name: "María Rodríguez", role: "Social Media Specialist", email: "maria@company.com" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-900">Ireal</h1>
            <Badge variant="secondary">Mi Workspace</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              ⚙️ Configuración
            </Button>
            <Button size="sm">➕ Nueva Campaña</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
            <TabsTrigger value="campaigns">🎯 Campañas</TabsTrigger>
            <TabsTrigger value="calendar">📅 Calendario</TabsTrigger>
            <TabsTrigger value="team">👥 Equipo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
                  <span className="text-2xl">🎯</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
                  <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$35,500</div>
                  <p className="text-xs text-muted-foreground">+15% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contenido Publicado</CardTitle>
                  <span className="text-2xl">📝</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+8 esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
                  <span className="text-2xl">👥</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-xs text-muted-foreground">Equipo completo</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones en tu workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Campaña "Summer Product Launch" actualizada</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">📝</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo contenido programado para Instagram</p>
                      <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">👤</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">María se unió al equipo</p>
                      <p className="text-xs text-muted-foreground">Ayer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Campañas</h2>
              <Button>➕ Nueva Campaña con IA</Button>
            </div>

            <div className="grid gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{campaign.name}</CardTitle>
                      <Badge
                        variant={
                          campaign.status === "active"
                            ? "default"
                            : campaign.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {campaign.status === "active"
                          ? "🟢 Activa"
                          : campaign.status === "completed"
                            ? "✅ Completada"
                            : "📝 Borrador"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {campaign.startDate} - {campaign.endDate} • Presupuesto: {campaign.budget}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span>{campaign.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          📝 Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          📊 Analíticas
                        </Button>
                        <Button variant="outline" size="sm">
                          🤖 Chat IA
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Calendario de Contenido</h2>
              <Button>➕ Nuevo Contenido</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contenido Programado</CardTitle>
                <CardDescription>Próximas publicaciones en redes sociales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentPieces.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">
                          {content.platform === "Instagram" ? "📷" : content.platform === "LinkedIn" ? "💼" : "📘"}
                        </span>
                        <div>
                          <p className="font-medium">{content.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {content.platform} • {content.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          content.status === "published"
                            ? "default"
                            : content.status === "scheduled"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {content.status === "published"
                          ? "✅ Publicado"
                          : content.status === "scheduled"
                            ? "⏰ Programado"
                            : "📝 Borrador"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Equipo</h2>
              <Button>➕ Invitar Miembro</Button>
            </div>

            <div className="grid gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        ⚙️ Gestionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

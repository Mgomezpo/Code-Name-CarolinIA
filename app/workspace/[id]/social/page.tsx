"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface SocialConnection {
  id: string
  platform: string
  account_name: string
  account_id: string
  is_active: boolean
  created_at: string
  expires_at?: string
}

export default function SocialMediaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newConnection, setNewConnection] = useState({
    platform: "",
    accountName: "",
    accountId: "",
    accessToken: "",
    refreshToken: "",
    expiresAt: "",
  })

  useEffect(() => {
    loadConnections()
  }, [params.id])

  const loadConnections = async () => {
    try {
      const response = await fetch(`/api/social/connections?workspaceId=${params.id}`)
      const data = await response.json()

      if (data.connections) {
        setConnections(data.connections)
      }
    } catch (error) {
      console.error("Failed to load connections:", error)
    } finally {
      setLoading(false)
    }
  }

  const addConnection = async () => {
    if (
      !newConnection.platform ||
      !newConnection.accountName ||
      !newConnection.accountId ||
      !newConnection.accessToken
    ) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/social/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: params.id,
          platform: newConnection.platform,
          accountName: newConnection.accountName,
          accountId: newConnection.accountId,
          accessToken: newConnection.accessToken,
          refreshToken: newConnection.refreshToken || null,
          expiresAt: newConnection.expiresAt || null,
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewConnection({
          platform: "",
          accountName: "",
          accountId: "",
          accessToken: "",
          refreshToken: "",
          expiresAt: "",
        })
        loadConnections()
      } else {
        alert("Failed to add connection")
      }
    } catch (error) {
      alert("Failed to add connection")
    }
  }

  const getPlatformIcon = (platform: string) => {
    const icons = {
      instagram: <Instagram className="w-5 h-5" />,
      facebook: <Facebook className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      twitter: <Twitter className="w-5 h-5" />,
      tiktok: <div className="w-5 h-5 bg-black rounded-full" />,
    }
    return icons[platform as keyof typeof icons] || <Settings className="w-5 h-5" />
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      instagram: "bg-pink-100 text-pink-800 border-pink-200",
      facebook: "bg-blue-100 text-blue-800 border-blue-200",
      linkedin: "bg-indigo-100 text-indigo-800 border-indigo-200",
      twitter: "bg-sky-100 text-sky-800 border-sky-200",
      tiktok: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[platform as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Social Media Connections</h1>
              <p className="text-slate-600 mt-2">Connect your social media accounts for publishing</p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Connection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Social Media Connection</DialogTitle>
                  <DialogDescription>Connect a social media account to enable publishing</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select onValueChange={(value) => setNewConnection((prev) => ({ ...prev, platform: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={newConnection.accountName}
                      onChange={(e) => setNewConnection((prev) => ({ ...prev, accountName: e.target.value }))}
                      placeholder="@username or Page Name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountId">Account ID</Label>
                    <Input
                      id="accountId"
                      value={newConnection.accountId}
                      onChange={(e) => setNewConnection((prev) => ({ ...prev, accountId: e.target.value }))}
                      placeholder="Platform-specific account ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={newConnection.accessToken}
                      onChange={(e) => setNewConnection((prev) => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="Platform access token"
                    />
                  </div>

                  <div>
                    <Label htmlFor="refreshToken">Refresh Token (Optional)</Label>
                    <Input
                      id="refreshToken"
                      type="password"
                      value={newConnection.refreshToken}
                      onChange={(e) => setNewConnection((prev) => ({ ...prev, refreshToken: e.target.value }))}
                      placeholder="Platform refresh token"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiresAt">Token Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={newConnection.expiresAt}
                      onChange={(e) => setNewConnection((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>

                  <Button onClick={addConnection} className="w-full">
                    Add Connection
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <Card key={connection.id} className={`border-2 ${getPlatformColor(connection.platform)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(connection.platform)}
                      <div>
                        <CardTitle className="text-lg capitalize">{connection.platform}</CardTitle>
                        <CardDescription>{connection.account_name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTokenExpired(connection.expires_at) ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Status:</span>
                      <Badge variant={connection.is_active ? "default" : "secondary"}>
                        {connection.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Connected:</span>
                      <span>{new Date(connection.created_at).toLocaleDateString()}</span>
                    </div>

                    {connection.expires_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Token Expires:</span>
                        <span className={isTokenExpired(connection.expires_at) ? "text-red-600" : "text-slate-900"}>
                          {new Date(connection.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                  <Instagram className="w-8 h-8 text-pink-500" />
                  <Facebook className="w-8 h-8 text-blue-500" />
                  <Linkedin className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No social media connections</h3>
              <p className="text-slate-600 mb-4">
                Connect your social media accounts to start publishing content directly from Ireal.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Publishing Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Connect Social Media Accounts</CardTitle>
            <CardDescription>Follow these steps to connect your accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram Business
                </h4>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Go to Facebook Developer Console</li>
                  <li>Create an app with Instagram Basic Display</li>
                  <li>Get your access token</li>
                  <li>Add the token and account details here</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-indigo-500" />
                  LinkedIn Pages
                </h4>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Go to LinkedIn Developer Portal</li>
                  <li>Create an app with Share on LinkedIn</li>
                  <li>Complete OAuth flow</li>
                  <li>Add the access token here</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

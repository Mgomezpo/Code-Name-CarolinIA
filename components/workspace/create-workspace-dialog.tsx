"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface CreateWorkspaceDialogProps {
  userId: string
  onWorkspaceCreated?: () => void
}

export function CreateWorkspaceDialog({ userId, onWorkspaceCreated }: CreateWorkspaceDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          owner_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      // Reset form
      setName("")
      setDescription("")
      setOpen(false)

      // Refresh the page or call callback
      if (onWorkspaceCreated) {
        onWorkspaceCreated()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Failed to create workspace")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] hover:from-[hsl(var(--color-primary))] hover:to-[hsl(var(--color-accent))]">
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>Create a new workspace to organize your media plans and campaigns.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="e.g., Acme Corp Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

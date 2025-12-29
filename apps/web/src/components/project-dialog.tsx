'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { projectsApi } from '@/lib/api'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: { id: string; name: string }
  onSuccess: () => void
}

export function ProjectDialog({ open, onOpenChange, project, onSuccess }: ProjectDialogProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (project) {
      setName(project.name)
    } else {
      setName('')
    }
    setError('')
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (project) {
        await projectsApi.update(project.id, { name })
      } else {
        await projectsApi.create({ name })
      }
      onSuccess()
      onOpenChange(false)
      setName('')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
            <DialogDescription>
              {project ? 'Update your project details' : 'Create a new project to organize your tasks'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : project ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


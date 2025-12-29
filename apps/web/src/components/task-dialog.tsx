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
import { tasksApi } from '@/lib/api'

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  projectId: string
}

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  projects: Project[]
  defaultProjectId?: string
  onSuccess: () => void
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  projects,
  defaultProjectId,
  onSuccess,
}: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(defaultProjectId || '')
  const [status, setStatus] = useState('TODO')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setProjectId(task.projectId)
      setStatus(task.status)
    } else {
      setTitle('')
      setDescription('')
      setProjectId(defaultProjectId || projects[0]?.id || '')
      setStatus('TODO')
    }
    setError('')
  }, [task, open, defaultProjectId, projects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) {
      setError('Please select a project')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      if (task) {
        await tasksApi.update(task.id, { title, description, status })
      } else {
        await tasksApi.create({ title, description, projectId, status })
      }
      onSuccess()
      onOpenChange(false)
      setTitle('')
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {task ? 'Update your task details' : 'Add a new task to your project'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!task && (
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <select
                  id="project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isLoading || !!task}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
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
              {isLoading ? 'Saving...' : task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


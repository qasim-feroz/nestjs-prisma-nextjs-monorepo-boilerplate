'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react'
import { projectsApi, tasksApi } from '@/lib/api'
import { TaskDialog } from '@/components/task-dialog'

const statusIcons = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
}

const statusColors = {
  TODO: 'text-muted-foreground',
  IN_PROGRESS: 'text-blue-500',
  DONE: 'text-green-500',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [projectData, tasksData] = await Promise.all([
        projectsApi.getOne(projectId),
        tasksApi.getAll(projectId),
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (error: any) {
      console.error('Failed to load data:', error)
      if (error.message.includes('Unauthorized') || error.message.includes('403')) {
        router.push('/projects')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await tasksApi.delete(id)
      loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await tasksApi.update(taskId, { status: newStatus })
      loadData()
    } catch (error: any) {
      alert(error.message || 'Failed to update task status')
    }
  }

  const handleDialogSuccess = () => {
    loadData()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Project not found
            </div>
            <Button onClick={() => router.push('/projects')} variant="outline" className="w-full">
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              {tasks.length} tasks in this project
            </p>
          </div>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Tasks by Status */}
      <div className="grid gap-4 md:grid-cols-3">
        {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => {
          const StatusIcon = statusIcons[status]
          const tasksInStatus = tasksByStatus[status]

          return (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <StatusIcon className={`h-5 w-5 ${statusColors[status]}`} />
                  {status.replace('_', ' ')}
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    ({tasksInStatus.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasksInStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks
                  </p>
                ) : (
                  tasksInStatus.map((task) => (
                    <Card
                      key={task.id}
                      className="p-3 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleEditTask(task)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTask(task.id)
                          }}
                        >
                          <span className="text-xs">×</span>
                        </Button>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(task.id, s)
                            }}
                            className={`text-xs px-2 py-1 rounded ${
                              task.status === s
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-accent'
                            }`}
                          >
                            {s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                          </button>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask || undefined}
        projects={[project]}
        defaultProjectId={projectId}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}


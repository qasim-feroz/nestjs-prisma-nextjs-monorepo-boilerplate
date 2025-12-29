'use client'

import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, FolderKanban } from 'lucide-react'
import { projectsApi, tasksApi } from '@/lib/api'
import { TaskDialog } from '@/components/task-dialog'
import { useSearchParams } from 'next/navigation'

function TasksPageContent() {
  const searchParams = useSearchParams()
  const selectedProjectId = searchParams.get('projectId')
  
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [selectedProjectId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [projectsData, tasksData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll(selectedProjectId || undefined),
      ])
      setProjects(projectsData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load data:', error)
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

  const handleDialogSuccess = () => {
    loadData()
  }

  const filteredTasks = selectedProjectId
    ? tasks.filter((t) => t.projectId === selectedProjectId)
    : tasks

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {selectedProjectId
              ? `Tasks for selected project`
              : 'View and manage all your tasks'}
          </p>
        </div>
        <Button onClick={handleCreateTask} disabled={projects.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Project Filter */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedProjectId ? 'default' : 'outline'}
                size="sm"
                onClick={() => window.location.href = '/tasks'}
              >
                All Tasks
              </Button>
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProjectId === project.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => window.location.href = `/tasks?projectId=${project.id}`}
                >
                  <FolderKanban className="h-3 w-3 mr-2" />
                  {project.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Tasks Yet</CardTitle>
            <CardDescription>
              {projects.length === 0
                ? 'Create a project first, then add tasks to it.'
                : 'Create your first task to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 && (
              <Button onClick={handleCreateTask} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <FolderKanban className="h-3 w-3" />
                      {task.project.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'DONE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {task.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask || undefined}
        projects={projects}
        defaultProjectId={selectedProjectId || undefined}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  )
}

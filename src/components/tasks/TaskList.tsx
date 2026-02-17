'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTask, completeTask } from '@/app/(dashboard)/task-actions'

interface Task {
  id: string
  title: string
  description: string | null
  assigned_to: string
  assigned_by: string
  status: string
  created_at: string
}

interface TaskListProps {
  tasks: Task[]
  currentUserId: string
  currentUserEmail: string
  profiles: { id: string; display_name: string | null; email: string }[]
}

export function TaskList({ tasks, currentUserId, currentUserEmail, profiles }: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const profileMap = new Map(profiles.map((p) => [p.id, p]))
  const otherUser = profiles.find((p) => p.id !== currentUserId)
  const otherEmail = otherUser?.email || ''

  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  function handleCreate() {
    if (!title.trim()) return
    startTransition(async () => {
      await createTask(title.trim(), '', otherEmail)
      setTitle('')
      setShowForm(false)
    })
  }

  function handleComplete(taskId: string) {
    startTransition(async () => {
      await completeTask(taskId)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="h-8 text-primary"
        >
          <Plus className="h-4 w-4 mr-1" />
          Assign
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <Input
              placeholder={`Assign task to ${otherUser?.display_name || 'other'}...`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="text-base"
              autoFocus
              style={{ fontSize: '16px' }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={isPending || !title.trim()} className="flex-1">
                {isPending ? 'Creating...' : `Assign to ${otherUser?.display_name || 'other'}`}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingTasks.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground px-1">No pending tasks</p>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => {
            const assignee = profileMap.get(task.assigned_to)
            const isAssignedToMe = task.assigned_to === currentUserId
            return (
              <Card key={task.id} className="border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={isPending}
                    className="h-10 w-10 rounded-full border-2 border-primary/30 flex items-center justify-center hover:bg-primary/10 active:scale-95 transition-all flex-shrink-0"
                    aria-label="Complete task"
                  >
                    <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {isAssignedToMe ? 'For you' : `For ${assignee?.display_name || 'other'}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {completedTasks.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            {completedTasks.length} completed
          </summary>
          <div className="space-y-1 mt-2">
            {completedTasks.slice(0, 5).map((task) => (
              <p key={task.id} className="text-xs text-muted-foreground line-through px-1">
                {task.title}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

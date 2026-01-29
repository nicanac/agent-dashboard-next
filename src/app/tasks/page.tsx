"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, Plus, Loader2, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Task {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'done'
  priority: 'P0' | 'P1' | 'P2' | 'P3'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function syncNotion() {
    setSyncing(true)
    try {
      await fetch('/api/sync', { method: 'POST' })
      await fetchTasks()
    } catch (error) {
      console.error('Sync failed', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Queue</h2>
          <p className="text-muted-foreground">Manage your agent priorities and todo list.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={syncNotion} disabled={syncing}>
             <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
             {syncing ? 'Syncing...' : 'Sync Notion'}
           </Button>
           <Button>
             <Plus className="mr-2 h-4 w-4" /> New Task
           </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No tasks found. Sync with Notion to get started!
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="rounded-xl border-none shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {task.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : task.status === "in-progress" ? (
                    <Clock className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                  <div>
                    <h3 className={`font-medium ${task.status === "done" && "line-through text-muted-foreground"}`}>
                      {task.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.priority === 'P0' ? 'destructive' : 'outline'}>
                    {task.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, PauseCircle, StopCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Session {
  session_key: string
  status: 'active' | 'paused' | 'stopped'
  model: string
  started_at: string
  token_usage: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetchSessions()
    
    const channel = supabase.channel('sessions_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, fetchSessions)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchSessions() {
    const { data } = await supabase.from('sessions').select('*')
    if (data) setSessions(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Monitor</h2>
          <p className="text-muted-foreground">Manage active agent sessions and resource usage.</p>
        </div>
        <Button variant="outline" onClick={() => fetchSessions()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessions.length === 0 ? (
           <div className="col-span-full text-center p-12 bg-slate-50 rounded-xl border border-dashed">
             <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
             <p className="text-muted-foreground">No active sessions found.</p>
           </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.session_key} className="rounded-xl border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-mono">{session.session_key}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Started: {new Date(session.started_at).toLocaleString()}</p>
                  </div>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Model</span>
                       <span className="font-medium">{session.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Token Usage</span>
                       <span className="font-medium">{session.token_usage.toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-4 flex gap-2">
                       <Button size="sm" variant="outline" className="w-full">
                          <PauseCircle className="mr-2 h-4 w-4" /> Pause
                       </Button>
                       <Button size="sm" variant="destructive" className="w-full">
                          <StopCircle className="mr-2 h-4 w-4" /> Kill
                       </Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

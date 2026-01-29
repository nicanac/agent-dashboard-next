"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Activity, Zap, MoreVertical, Briefcase } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    totalActivities: 0,
    activeSessions: 0
  })

  useEffect(() => {
    async function fetchStats() {
      // Pending Tasks
      const { count: pending } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      // Completed Tasks
      const { count: completed } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done')

      // Total Activities (All time for now, or last 24h)
      const { count: activities } = await supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })

      // Active Sessions
      const { count: sessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      setStats({
        pendingTasks: pending || 0,
        completedTasks: completed || 0,
        totalActivities: activities || 0,
        activeSessions: sessions || 0
      })
    }

    fetchStats()
    
    // Subscribe to changes for stats updates
    const taskChannel = supabase.channel('stats_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchStats)
      .subscribe()

    return () => {
      supabase.removeChannel(taskChannel)
    }
  }, [])

  // Mock chart data for now (placeholder until we have real analytics)
  const chartData = [
    { name: 'Mon', activities: 40 },
    { name: 'Tue', activities: 30 },
    { name: 'Wed', activities: 20 },
    { name: 'Thu', activities: 27 },
    { name: 'Fri', activities: 18 },
    { name: 'Sat', activities: 23 },
    { name: 'Sun', activities: 34 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Row A: Summary Cards (Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1 text-right">
              <span className="text-2xl font-bold tracking-tight block">{stats.pendingTasks}</span>
              <span className="text-xs text-muted-foreground font-medium">Pending Tasks</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
               <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-1 text-right">
              <span className="text-2xl font-bold tracking-tight block">{stats.completedTasks}</span>
              <span className="text-xs text-muted-foreground font-medium">Completed</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
               <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div className="space-y-1 text-right">
              <span className="text-2xl font-bold tracking-tight block">{stats.totalActivities}</span>
              <span className="text-xs text-muted-foreground font-medium">Total Actions</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
               <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-1 text-right">
              <span className="text-2xl font-bold tracking-tight block">{stats.activeSessions}</span>
              <span className="text-xs text-muted-foreground font-medium">Active Agents</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
               <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row B: Analytics & Real-Time Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Analytics Chart (2/3) */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <Card className="rounded-xl border-none shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-semibold text-lg">Agent Activity Volume</h3>
               <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="activities" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAct)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Stacked (1/3) */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Highlight Card: Quick Task Add or Highlight */}
          <Card className="rounded-xl border-none shadow-md bg-blue-600 text-white overflow-hidden relative p-6">
             <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">My Inbox</h3>
                  <p className="text-blue-100 text-sm">You have {stats.pendingTasks} pending tasks in your queue.</p>
                </div>
                <Button className="mt-4 bg-white text-blue-600 hover:bg-blue-50 w-full font-semibold" asChild>
                  <Link href="/tasks">Manage Tasks</Link>
                </Button>
             </div>
          </Card>

          {/* Activity Feed */}
          <ActivityFeed />

        </div>

      </div>
    </div>
  )
}

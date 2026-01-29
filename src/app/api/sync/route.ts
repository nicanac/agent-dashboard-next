import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { createClient } from '@supabase/supabase-js'

const notion = new Client({ auth: process.env.NOTION_KEY })
const notionDbId = process.env.NOTION_DATABASE_ID!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    // 1. Fetch from Notion
    const notionResponse = await notion.databases.query({
      database_id: notionDbId,
    })
    
    const notionTasks = notionResponse.results.map((page: any) => ({
      notion_id: page.id,
      title: page.properties.Name.title[0]?.plain_text || 'Untitled',
      status: mapNotionStatus(page.properties.Status.select?.name),
      priority: page.properties.Priority.select?.name || 'P3',
    }))

    // 2. Sync Notion -> Supabase (Upsert)
    // We assume Notion is the master for now, or last-write-wins (simplified)
    for (const task of notionTasks) {
       await supabase.from('tasks').upsert({
          notion_id: task.notion_id,
          title: task.title,
          status: task.status,
          priority: task.priority
       }, { onConflict: 'notion_id' })
    }

    // 3. (Optional) Sync Supabase -> Notion would go here
    // For MVP, let's just pull from Notion to populate Supabase

    return NextResponse.json({ success: true, count: notionTasks.length })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

function mapNotionStatus(notionStatus: string): string {
  switch (notionStatus) {
    case 'Done': return 'done'
    case 'In Progress': return 'in-progress'
    default: return 'pending'
  }
}

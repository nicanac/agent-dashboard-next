# Product Requirements Document (PRD)

## 1. Introduction
**Project Name:** Agent Dashboard (formerly Duralux Dashboard)
**Objective:** A central hub to monitor Clawdbot's activity, manage tasks, and track sessions in real-time.
**Integrations:** Clawdbot (Activity Logs), Supabase (Backend), Notion (Task Sync), Strava (Training Data).

## 2. Core Features (MVP)
### 2.1 Task Queue / Inbox (`/tasks`)
- **Functionality:** Submit and manage tasks.
- **Properties:** Title, Priority (P0-P3), Status (Pending/In Progress/Done), Context/Files.
- **Integration:** Bidirectional sync with Notion.

### 2.2 Activity Log (`/dashboard`)
- **Functionality:** Real-time timeline of agent actions.
- **Data Points:** Timestamp, Type (Coding/Research/Comms), Summary, Details (JSON).
- **Visualization:** Feed/List view, filterable by type.

### 2.3 Session Monitor (`/sessions`)
- **Functionality:** Live view of active agent sessions (Main + Sub-agents).
- **Data Points:** Session Key, Status, Model Used, Started At, Token/Cost usage.
- **Actions:** Pause/Kill session.

### 2.4 Quick Actions
- "New Task" button.
- Shortcuts: "Check Strava", "Check Weather".

### 2.5 Stats Dashboard
- Tasks completed this week.
- Token usage trends.
- Most used skills.

## 3. Tech Stack
- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui.
- **Backend:** Supabase (Database + Realtime Subscriptions).
- **Deployment:** Vercel.
- **Repo:** https://github.com/nicanac/agent-dashboard-next

## 4. Database Schema (Supabase)
- `tasks`: `id`, `title`, `priority`, `status`, `created_at`, `completed_at`, `notion_id`
- `activity_log`: `id`, `type`, `summary`, `details` (jsonb), `session_key`, `created_at`
- `sessions`: `session_key`, `status`, `model`, `started_at`, `token_usage`

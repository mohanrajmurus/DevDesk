import { useState, type MouseEvent } from "react"
import { Link } from "react-router-dom"
import { Check, Plus } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { ActiveTimerBanner } from "@/components/ActiveTimerBanner"
import { TaskDetailsDrawer } from "@/components/TaskDetailsDrawer"
import { CreateProjectSheet } from "@/components/CreateProjectSheet"
import { Badge } from "@/components/ui/badge"
import { useMe } from "@/features/auth/queries"
import { useProjects } from "@/features/projects/queries"
import { useAllTimeLogs } from "@/features/timelogs/queries"
import { useTasks, useUpdateTask } from "@/features/tasks/queries"
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_STYLES } from "@/features/tasks/constants"
import type { Task as RealTask } from "@/features/tasks/types"
import type { Project } from "@/features/projects/types"
import { formatMinutes } from "@/lib/constants"

function isDueToday(dueDate?: string) {
  if (!dueDate) return false
  return new Date(dueDate).toDateString() === new Date().toDateString()
}

function formatDue(dueDate?: string) {
  if (!dueDate) return "No due date"
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.setHours(0, 0, 0, 0) - today.getTime()) / 86_400_000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"
  if (diffDays < 0) return `${-diffDays} days overdue`
  return due.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function TaskDueRow({
  task,
  project,
  onSelect,
}: {
  task: RealTask
  project?: Project
  onSelect: (id: string) => void
}) {
  const updateTask = useUpdateTask(task._id, task.project)
  const isDone = task.status === "done"

  const toggle = (e: MouseEvent) => {
    e.stopPropagation()
    updateTask.mutate({ status: isDone ? "todo" : "done" })
  }

  return (
    <div
      onClick={() => onSelect(task._id)}
      className="flex items-center gap-3 py-2.5 px-1 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors"
    >
      <button
        onClick={toggle}
        disabled={updateTask.isPending}
        className="size-[17px] rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
        style={{
          borderColor: isDone ? "#0070f3" : "#a1a1a1",
          background: isDone ? "#0070f3" : "transparent",
        }}
      >
        {isDone && <Check className="size-2.5 text-white" strokeWidth={3} />}
      </button>
      <span
        className="flex-1 text-[13.5px]"
        style={{
          textDecoration: isDone ? "line-through" : "none",
          color: isDone ? "#a1a1a1" : "inherit",
        }}
      >
        {task.title}
      </span>
      {project && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-[120px] shrink-0 truncate">
          <span className="size-1.5 rounded-full shrink-0" style={{ background: project.color.hex }} />
          {project.name}
        </span>
      )}
      <Badge
        variant="secondary"
        className={`w-[52px] justify-center rounded-md font-medium text-[11px] ${TASK_PRIORITY_STYLES[task.priority]}`}
      >
        {TASK_PRIORITY_LABELS[task.priority]}
      </Badge>
      <span className="text-xs text-muted-foreground/70 w-[60px] text-right shrink-0">Today</span>
    </div>
  )
}

function startOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + diff)
  return d
}

export default function Dashboard() {
  const { data: me } = useMe()
  const { data: projects } = useProjects()
  const { data: timelogs } = useAllTimeLogs()
  const { data: allTasks } = useTasks()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [projectSheetOpen, setProjectSheetOpen] = useState(false)

  const projectById = new Map((projects ?? []).map((p) => [p._id, p]))
  const tasksDueToday = (allTasks ?? []).filter((t) => isDueToday(t.dueDate))
  const highPriorityTasks = (allTasks ?? [])
    .filter((t) => t.priority === "high" && t.status !== "done")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 5)
  const weekStart = startOfWeek()

  const weeklyMinutesByProject = new Map<string, number>()
  for (const log of timelogs ?? []) {
    if (!log.endTime || new Date(log.startTime) < weekStart) continue
    const mins = Math.max(
      0,
      Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000)
    )
    weeklyMinutesByProject.set(log.project, (weeklyMinutesByProject.get(log.project) ?? 0) + mins)
  }

  const weeklySummary = Array.from(weeklyMinutesByProject.entries())
    .map(([projectId, mins]) => {
      const project = projectById.get(projectId)
      return { projectId, name: project?.name ?? "Unknown project", color: project?.color.hex ?? "#a1a1a1", mins }
    })
    .sort((a, b) => b.mins - a.mins)

  const weeklyMax = Math.max(1, ...weeklySummary.map((w) => w.mins))
  const weeklyTotal = weeklySummary.reduce((sum, w) => sum + w.mins, 0)

  const statCards = [
    { label: "Projects", value: projects?.length ?? 0 },
    { label: "Tasks", value: allTasks?.length ?? 0 },
    { label: "This week", value: formatMinutes(weeklyTotal) },
  ]

  return (
    <AppShell active="dashboard">
      <div className="mb-5.5">
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight mb-1">
          {greeting()}{me?.user.name ? `, ${me.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-[13.5px] text-muted-foreground">Here's what's happening today.</p>
      </div>

      <ActiveTimerBanner />

      <div className="grid grid-cols-3 gap-2 mb-7 lg:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="border border-border rounded-xl px-4 py-3.5 bg-card">
            <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-1.5">
              {s.label}
            </div>
            <div className="font-semibold text-[28px] tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-7">
          <section>
            <div className="flex items-baseline justify-between mb-3 border-b border-border pb-2">
              <h2 className="text-[15px] font-semibold tracking-tight">Tasks Due Today</h2>
              <Link to="/tasks" className="text-xs text-[#0070f3] font-medium hover:underline">
                View all tasks
              </Link>
            </div>
            {tasksDueToday.length > 0 ? (
              <div className="flex flex-col">
                {tasksDueToday.map((task) => (
                  <TaskDueRow
                    key={task._id}
                    task={task}
                    project={projectById.get(task.project)}
                    onSelect={setSelectedTaskId}
                  />
                ))}
              </div>
            ) : (
              <div className="py-5 px-1 text-[13px] text-muted-foreground/70">No tasks due today.</div>
            )}
          </section>

          <section>
            <div className="mb-3 border-b border-border pb-2">
              <h2 className="text-[15px] font-semibold tracking-tight">High Priority Focus</h2>
            </div>
            {highPriorityTasks.length > 0 ? (
              <div className="flex flex-col">
                {highPriorityTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => setSelectedTaskId(task._id)}
                    className="flex items-center gap-3 py-2.5 px-3 border border-border rounded-[10px] mb-2 bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <span className="flex-1">
                      <div className="text-[13.5px] font-medium">{task.title}</div>
                      <div className="text-[11.5px] text-muted-foreground/70 mt-0.5">
                        {projectById.get(task.project)?.name ?? "Unknown project"} · Due {formatDue(task.dueDate)}
                      </div>
                    </span>
                    <Badge className={`rounded-md text-[11px] font-medium ${TASK_PRIORITY_STYLES.high}`}>
                      {TASK_PRIORITY_LABELS.high}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 px-1 text-[13px] text-muted-foreground/70">No high priority tasks open.</div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-7">
          <section>
            <div className="mb-3 border-b border-border pb-2">
              <h2 className="text-[15px] font-semibold tracking-tight">Weekly Time by Project</h2>
            </div>
            {weeklySummary.length > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  {weeklySummary.map((ws) => (
                    <div key={ws.projectId}>
                      <div className="flex justify-between text-[13px] mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full" style={{ background: ws.color }} />
                          {ws.name}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{formatMinutes(ws.mins)}</span>
                      </div>
                      <div className="h-[5px] bg-secondary w-full rounded-full">
                        <div
                          className="h-[5px] rounded-full"
                          style={{ width: `${Math.round((ws.mins / weeklyMax) * 100)}%`, background: ws.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3.5 pt-2.5 border-t border-border text-[13px] font-semibold">
                  <span>Total this week</span>
                  <span>{formatMinutes(weeklyTotal)}</span>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground/70 py-2">No time logged this week yet.</p>
            )}
          </section>
        </div>
      </div>

      <TaskDetailsDrawer
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        taskId={selectedTaskId}
      />

      <button
        onClick={() => setProjectSheetOpen(true)}
        aria-label="Add project"
        className="fixed bottom-20 right-4 z-30 flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors lg:hidden"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>
      <CreateProjectSheet open={projectSheetOpen} onOpenChange={setProjectSheetOpen} />
    </AppShell>
  )
}

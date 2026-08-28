import { useCallback, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { CreateTaskSheet } from "@/components/CreateTaskSheet"
import { TaskDetailsDrawer } from "@/components/TaskDetailsDrawer"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { ListRowsSkeleton } from "@/components/skeletons"
import { useFilteredTasks, useInfiniteTasks } from "@/features/tasks/queries"
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_STYLES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_STYLES,
} from "@/features/tasks/constants"
import type { TaskPriority, TaskStatus } from "@/features/tasks/types"
import { useProjects } from "@/features/projects/queries"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

const PAGE_SIZE = 20

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [page, setPage] = useState(1)
  const isMobile = useIsMobile()

  const filters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  }

  const filteredTasks = useFilteredTasks({ ...filters, page, pageSize: PAGE_SIZE }, { enabled: !isMobile })
  const tasks = filteredTasks.data
  const infiniteTasks = useInfiniteTasks(filters, { enabled: isMobile })
  const isLoading = isMobile ? infiniteTasks.isLoading : filteredTasks.isLoading

  const { data: projects } = useProjects()
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const projectById = new Map((projects ?? []).map((p) => [p._id, p]))

  const items = isMobile ? (infiniteTasks.data?.pages.flatMap((p) => p.items) ?? []) : (tasks?.items ?? [])
  const total = isMobile ? (infiniteTasks.data?.pages[0]?.total ?? 0) : (tasks?.total ?? 0)

  const loadMore = useCallback(() => {
    if (infiniteTasks.hasNextPage && !infiniteTasks.isFetchingNextPage) infiniteTasks.fetchNextPage()
  }, [infiniteTasks])
  const sentinelRef = useInfiniteScroll({ onIntersect: loadMore, enabled: isMobile })

  const handleStatusFilterChange = (v: TaskStatus | "all") => {
    setStatusFilter(v)
    setPage(1)
  }

  const handlePriorityFilterChange = (v: TaskPriority | "all") => {
    setPriorityFilter(v)
    setPage(1)
  }

  return (
    <AppShell active="tasks">
      <div className="mb-5.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight mb-1">Tasks</h1>
          <p className="text-[13.5px] text-muted-foreground">{total} tasks total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={statusFilter} onValueChange={(v) => handleStatusFilterChange(v as TaskStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => handlePriorityFilterChange(v as TaskPriority | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" className="gap-1.5 pl-2.5" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ListRowsSkeleton rows={7} className="space-y-2.5" />
      ) : items.length > 0 ? (
        <div className="space-y-2.5">
          {items.map((task) => {
            const project = projectById.get(task.project)
            return (
              <div
                key={task._id}
                onClick={() => setSelectedTaskId(task._id)}
                className="border border-border rounded-xl px-4 py-3 bg-card flex flex-col gap-2 cursor-pointer hover:border-foreground/20 transition-colors lg:flex-row lg:items-center lg:gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{task.title}</div>
                  {task.description && (
                    <p className="text-[12.5px] text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {project && (
                    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground lg:w-[140px] shrink-0 truncate">
                      <span className="size-1.5 rounded-full shrink-0" style={{ background: project.color.hex }} />
                      {project.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-[11.5px] text-muted-foreground/70 shrink-0">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_PRIORITY_STYLES[task.priority]}`}
                  >
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_STATUS_STYLES[task.status]}`}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-[13.5px] text-muted-foreground/70 mt-16">
          {statusFilter !== "all" || priorityFilter !== "all" ? "No tasks match these filters." : "No tasks yet."}
        </p>
      )}

      {isMobile ? (
        <>
          {infiniteTasks.hasNextPage && (
            <div ref={sentinelRef} className="flex justify-center py-5">
              {infiniteTasks.isFetchingNextPage && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" strokeWidth={2} />
              )}
            </div>
          )}
        </>
      ) : (
        tasks && <Pagination page={tasks.page} totalPages={tasks.totalPages} onPageChange={setPage} />
      )}

      <CreateTaskSheet open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
      <TaskDetailsDrawer
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        taskId={selectedTaskId}
      />
    </AppShell>
  )
}

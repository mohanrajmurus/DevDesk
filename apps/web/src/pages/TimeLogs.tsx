import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Download, Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { TaskDetailsDrawer } from "@/components/TaskDetailsDrawer"
import { ManualTimeEntryDialog } from "@/components/ManualTimeEntryDialog"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { useTimeLogs, useInfiniteTimeLogs, useDeleteTimeLog } from "@/features/timelogs/queries"
import { timelogsApi } from "@/features/timelogs/api"
import { useTasks } from "@/features/tasks/queries"
import { useProjects } from "@/features/projects/queries"
import { formatMinutes } from "@/lib/constants"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

function getMonthOptions(count = 12) {
  const options: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    options.push({ value, label })
  }
  return options
}

const MONTH_OPTIONS = getMonthOptions()
const PAGE_SIZE = 20

export default function TimeLogs() {
  const [monthFilter, setMonthFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [addEntryOpen, setAddEntryOpen] = useState(false)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null)

  const isMobile = useIsMobile()
  const filters = {
    month: monthFilter === "all" ? undefined : monthFilter,
    projectId: projectFilter === "all" ? undefined : projectFilter,
  }

  const { data: timelogs } = useTimeLogs({ ...filters, page, pageSize: PAGE_SIZE }, { enabled: !isMobile })
  const infiniteTimeLogs = useInfiniteTimeLogs(filters, { enabled: isMobile })

  const { data: tasks } = useTasks()
  const { data: projects } = useProjects()
  const deleteTimeLog = useDeleteTimeLog()

  const taskById = new Map((tasks ?? []).map((t) => [t._id, t]))
  const projectById = new Map((projects ?? []).map((p) => [p._id, p]))
  const items = isMobile
    ? (infiniteTimeLogs.data?.pages.flatMap((p) => p.items) ?? [])
    : (timelogs?.items ?? [])
  const total = isMobile ? (infiniteTimeLogs.data?.pages[0]?.total ?? 0) : (timelogs?.total ?? 0)

  const loadMore = useCallback(() => {
    if (infiniteTimeLogs.hasNextPage && !infiniteTimeLogs.isFetchingNextPage) infiniteTimeLogs.fetchNextPage()
  }, [infiniteTimeLogs])
  const sentinelRef = useInfiniteScroll({ onIntersect: loadMore, enabled: isMobile })

  const handleMonthFilterChange = (v: string) => {
    setMonthFilter(v)
    setPage(1)
  }

  const handleProjectFilterChange = (v: string) => {
    setProjectFilter(v)
    setPage(1)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await timelogsApi.exportExcel({
        month: monthFilter === "all" ? undefined : monthFilter,
        projectId: projectFilter === "all" ? undefined : projectFilter,
      })

      const rowCount = Number(response.headers["x-row-count"] ?? "0")
      if (rowCount === 0) {
        toast.error("No time logs to export for the selected filters")
        return
      }

      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = `time-logs-${monthFilter === "all" ? "all-time" : monthFilter}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const logToDelete = items.find((l) => l._id === deleteLogId)
  const logToEdit = items.find((l) => l._id === editingLogId)
  const taskToEdit = logToEdit ? taskById.get(logToEdit.task) : undefined

  const handleDeleteLog = () => {
    if (!logToDelete) return
    deleteTimeLog.mutate(
      { id: logToDelete._id, taskId: logToDelete.task, projectId: logToDelete.project },
      {
        onSuccess: () => {
          toast.success("Time entry deleted")
          setDeleteLogId(null)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  }

  return (
    <AppShell active="timelogs">
      <div className="mb-5.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight mb-1">Time Logs</h1>
          <p className="text-[13.5px] text-muted-foreground">{total} entries</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={monthFilter} onValueChange={handleMonthFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={handleProjectFilterChange}>
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {(projects ?? []).map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: p.color.hex }} />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport} disabled={isExporting}>
            <Download className="size-3.5" strokeWidth={2} />
            {isExporting ? "Exporting..." : "Export"}
          </Button>

          <Button size="sm" className="gap-1.5" onClick={() => setAddEntryOpen(true)}>
            <Plus className="size-3.5" strokeWidth={2} />
            Add Entry
          </Button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((log) => {
            const task = taskById.get(log.task)
            const project = projectById.get(log.project)
            const start = new Date(log.startTime)
            const isRunning = !log.endTime
            const mins = isRunning
              ? null
              : Math.max(0, Math.round((new Date(log.endTime!).getTime() - start.getTime()) / 60000))

            return (
              <div
                key={log._id}
                onClick={() => task && setSelectedTaskId(task._id)}
                className="border border-border rounded-xl px-4 py-3 bg-card flex flex-col gap-2 cursor-pointer hover:border-foreground/20 transition-colors lg:flex-row lg:items-center lg:gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{task?.title ?? "Unknown task"}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">
                    {start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {!isRunning &&
                      ` – ${new Date(log.endTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    {log.source === "manual" && (
                      <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                        Manual
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {project && (
                    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground lg:w-[140px] shrink-0 truncate">
                      <span className="size-1.5 rounded-full shrink-0" style={{ background: project.color.hex }} />
                      {project.name}
                    </span>
                  )}

                  {isRunning ? (
                    <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-[#ffefcf] text-[#ab570a]">
                      Running
                    </span>
                  ) : (
                    <span className="shrink-0 text-[13px] font-medium lg:w-[60px] lg:text-right">
                      {formatMinutes(mins!)}
                    </span>
                  )}

                  {!isRunning && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingLogId(log._id)
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="size-3.5" strokeWidth={2} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteLogId(log._id)
                        }}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-3.5" strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-[13.5px] text-muted-foreground/70 mt-16">
          {monthFilter !== "all" || projectFilter !== "all" ? "No time logs match these filters." : "No time logged yet."}
        </p>
      )}

      {isMobile ? (
        <>
          {infiniteTimeLogs.hasNextPage && (
            <div ref={sentinelRef} className="flex justify-center py-5">
              {infiniteTimeLogs.isFetchingNextPage && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" strokeWidth={2} />
              )}
            </div>
          )}
        </>
      ) : (
        timelogs && <Pagination page={timelogs.page} totalPages={timelogs.totalPages} onPageChange={setPage} />
      )}

      <TaskDetailsDrawer
        open={Boolean(selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        taskId={selectedTaskId}
      />
      <ManualTimeEntryDialog open={addEntryOpen} onOpenChange={setAddEntryOpen} />
      <ManualTimeEntryDialog
        open={Boolean(logToEdit)}
        onOpenChange={(open) => !open && setEditingLogId(null)}
        task={taskToEdit}
        log={logToEdit}
      />
      <ConfirmDialog
        open={Boolean(deleteLogId)}
        onOpenChange={(open) => !open && setDeleteLogId(null)}
        title="Delete this time entry?"
        description="This time entry will be removed."
        onConfirm={handleDeleteLog}
        isPending={deleteTimeLog.isPending}
      />
    </AppShell>
  )
}

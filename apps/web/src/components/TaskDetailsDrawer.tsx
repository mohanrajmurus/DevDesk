import { useState } from "react"
import { Play, Square, Calendar, Pencil, Trash2, CheckCircle2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CreateTaskSheet } from "@/components/CreateTaskSheet"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { ManualTimeEntryDialog } from "@/components/ManualTimeEntryDialog"
import { useElapsed } from "@/hooks/use-elapsed"
import { useStartTimer, useStopTimer, useDeleteTimeLog, useTaskTimeLogs } from "@/features/timelogs/queries"
import { useDeleteTask, useTask, useUpdateTask } from "@/features/tasks/queries"
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_STYLES, TASK_STATUS_LABELS, TASK_STATUS_STYLES } from "@/features/tasks/constants"
import { formatMinutes } from "@/lib/constants"
import type { TimeLog } from "@/features/timelogs/types"

interface TaskDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
}

function RunningTimer({ startTime }: { startTime: string }) {
  const elapsed = useElapsed(startTime)
  return <span className="font-mono text-[20px] font-semibold tabular-nums tracking-tight">{elapsed}</span>
}

function TimerCard({
  running,
  onStart,
  onStop,
  starting,
  stopping,
}: {
  running?: TimeLog
  onStart: () => void
  onStop: () => void
  starting: boolean
  stopping: boolean
}) {
  if (running) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-red-700/80 dark:text-red-400/80">
              Recording
            </div>
            <RunningTimer startTime={running.startTime} />
          </div>
        </div>
        <Button
          size="icon-lg"
          variant="destructive"
          className="rounded-full size-11 shrink-0 shadow-sm"
          onClick={onStop}
          disabled={stopping}
          aria-label="Stop timer"
        >
          <Square className="size-4" strokeWidth={2.5} fill="currentColor" />
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border p-4 flex items-center justify-between gap-4">
      <div>
        <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70">
          Timer
        </div>
        <div className="text-[13px] text-muted-foreground mt-0.5">Not tracking time</div>
      </div>
      <Button
        size="icon-lg"
        className="rounded-full size-11 shrink-0 shadow-sm"
        onClick={onStart}
        disabled={starting}
        aria-label="Start timer"
      >
        <Play className="size-4 ml-0.5" strokeWidth={2.5} fill="currentColor" />
      </Button>
    </div>
  )
}

export function TaskDetailsDrawer({ open, onOpenChange, taskId }: TaskDetailsDrawerProps) {
  const { data: task } = useTask(taskId ?? "")
  const { data: timelogs } = useTaskTimeLogs(task?._id ?? "")
  const startTimer = useStartTimer()
  const stopTimer = useStopTimer()
  const updateTask = useUpdateTask(task?._id ?? "", task?.project)
  const deleteTask = useDeleteTask()
  const deleteTimeLog = useDeleteTimeLog()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [logEntryOpen, setLogEntryOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null)
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null)

  const running = timelogs?.find((log) => !log.endTime)
  const history = (timelogs ?? []).filter((log) => log.endTime)

  const handleStart = () => {
    if (!task) return
    startTimer.mutate(
      { taskId: task._id, projectId: task.project },
      { onError: (error) => toast.error(error.message) }
    )
  }

  const handleStop = () => {
    if (!task || !running) return
    stopTimer.mutate(
      { id: running._id, taskId: task._id, projectId: task.project },
      { onError: (error) => toast.error(error.message) }
    )
  }

  const handleDelete = () => {
    if (!task) return
    deleteTask.mutate(task._id, {
      onSuccess: () => {
        toast.success("Task deleted")
        setDeleteOpen(false)
        onOpenChange(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const handleDeleteLog = () => {
    if (!task || !deleteLogId) return
    deleteTimeLog.mutate(
      { id: deleteLogId, taskId: task._id, projectId: task.project },
      {
        onSuccess: () => {
          toast.success("Time entry deleted")
          setDeleteLogId(null)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  }

  const handleComplete = () => {
    if (!task) return
    const markDone = () => {
      updateTask.mutate(
        { status: "done" },
        {
          onSuccess: () => toast.success("Task marked as complete"),
          onError: (error) => toast.error(error.message),
        }
      )
    }
    if (running) {
      stopTimer.mutate(
        { id: running._id, taskId: task._id, projectId: task.project },
        { onSuccess: markDone, onError: (error) => toast.error(error.message) }
      )
    } else {
      markDone()
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full lg:w-[460px] lg:max-w-[460px] p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="text-base">{task?.title}</SheetTitle>
          </SheetHeader>

          {task && (
            <div className="flex-1 overflow-y-auto px-6 py-5.5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_STATUS_STYLES[task.status]}`}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_PRIORITY_STYLES[task.priority]}`}
                  >
                    {TASK_PRIORITY_LABELS[task.priority]} priority
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="size-3.5" strokeWidth={2} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} />
                    Delete
                  </button>
                </div>
              </div>

              {task.description && <p className="text-[13.5px] text-muted-foreground">{task.description}</p>}

              {task.dueDate && (
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" strokeWidth={2} />
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}

              {task.status !== "done" && (
                <TimerCard
                  running={running}
                  onStart={handleStart}
                  onStop={handleStop}
                  starting={startTimer.isPending}
                  stopping={stopTimer.isPending}
                />
              )}

              {task.status === "in-progress" && (
                <Button
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={handleComplete}
                  disabled={updateTask.isPending || stopTimer.isPending}
                >
                  <CheckCircle2 className="size-3.5" strokeWidth={2} />
                  Mark as Complete
                </Button>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    Time Logs
                  </div>
                  <button
                    onClick={() => setLogEntryOpen(true)}
                    className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3.5" strokeWidth={2} />
                    Add Entry
                  </button>
                </div>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((log) => {
                      const start = new Date(log.startTime)
                      const end = new Date(log.endTime!)
                      const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
                      return (
                        <div
                          key={log._id}
                          className="flex items-center justify-between text-[13px] border border-border rounded-lg px-3 py-2"
                        >
                          <span className="text-muted-foreground">
                            {start.toLocaleDateString()} ·{" "}
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" – "}
                            {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {log.source === "manual" && (
                              <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                                Manual
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2.5">
                            <span className="font-medium">{formatMinutes(mins)}</span>
                            <button
                              onClick={() => setEditingLog(log)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => setDeleteLogId(log._id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-3.5" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground/70">No completed time logs yet.</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CreateTaskSheet open={editOpen} onOpenChange={setEditOpen} task={task} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this task?"
        description={task ? `"${task.title}" will be deleted.` : undefined}
        onConfirm={handleDelete}
        isPending={deleteTask.isPending}
      />
      {task && (
        <ManualTimeEntryDialog
          open={logEntryOpen || Boolean(editingLog)}
          onOpenChange={(open) => {
            if (!open) {
              setLogEntryOpen(false)
              setEditingLog(null)
            }
          }}
          task={task}
          log={editingLog ?? undefined}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteLogId)}
        onOpenChange={(open) => !open && setDeleteLogId(null)}
        title="Delete this time entry?"
        description="This time entry will be removed."
        onConfirm={handleDeleteLog}
        isPending={deleteTimeLog.isPending}
      />
    </>
  )
}

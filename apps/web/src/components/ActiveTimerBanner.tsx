import type { MouseEvent } from "react"
import { Square } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useElapsed } from "@/hooks/use-elapsed"
import { useActiveTimer, useStopTimer } from "@/features/timelogs/queries"
import { useTask } from "@/features/tasks/queries"
import { useProject } from "@/features/projects/queries"

export function ActiveTimerBanner() {
  const { data: activeTimer } = useActiveTimer()
  const { data: task } = useTask(activeTimer?.task ?? "")
  const { data: project } = useProject(activeTimer?.project ?? "")
  const stopTimer = useStopTimer()
  const navigate = useNavigate()
  const elapsed = useElapsed(activeTimer?.startTime ?? new Date().toISOString())

  if (!activeTimer || !task || !project) return null

  const handleStop = (e: MouseEvent) => {
    e.stopPropagation()
    stopTimer.mutate(
      { id: activeTimer._id, taskId: task._id, projectId: project._id },
      {
        onSuccess: () => toast.success("Timer stopped"),
        onError: (error) => toast.error(error.message),
      }
    )
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="relative overflow-hidden flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 mb-6 cursor-pointer hover:border-foreground/20 transition-colors"
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: project.color.hex }} />

      <div className="flex items-center gap-4 pl-2 min-w-0">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Currently tracking
          </div>
          <div className="text-[14.5px] font-semibold tracking-tight truncate mt-0.5">{task.title}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mt-0.5">
            <span className="size-1.5 rounded-full shrink-0" style={{ background: project.color.hex }} />
            {project.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="font-mono text-[22px] font-semibold tabular-nums tracking-tight">{elapsed}</span>
        <Button
          size="icon-lg"
          variant="destructive"
          className="rounded-full size-11 shrink-0 shadow-sm"
          onClick={handleStop}
          disabled={stopTimer.isPending}
          aria-label="Stop timer"
        >
          <Square className="size-4" strokeWidth={2.5} fill="currentColor" />
        </Button>
      </div>
    </div>
  )
}

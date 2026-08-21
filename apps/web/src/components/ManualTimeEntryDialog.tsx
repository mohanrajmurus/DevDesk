import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateManualTimeLog, useUpdateTimeLog } from "@/features/timelogs/queries"
import { useTasks } from "@/features/tasks/queries"
import { useProjects } from "@/features/projects/queries"
import type { TimeLog } from "@/features/timelogs/types"

interface ManualTimeEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: { _id: string; project: string; title: string }
  log?: TimeLog
}

function todayISODate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function toDateInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function toTimeInput(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function ManualTimeEntryDialog({ open, onOpenChange, task, log }: ManualTimeEntryDialogProps) {
  const isEditMode = Boolean(log)
  const [taskId, setTaskId] = useState("")
  const [date, setDate] = useState(todayISODate())
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const createManual = useCreateManualTimeLog()
  const updateTimeLog = useUpdateTimeLog()
  const isPending = createManual.isPending || updateTimeLog.isPending
  const { data: tasks } = useTasks({ enabled: open && !task })
  const { data: projects } = useProjects()
  const projectById = new Map((projects ?? []).map((p) => [p._id, p]))

  useEffect(() => {
    if (!open) return
    setTaskId(task?._id ?? "")
    if (log) {
      const start = new Date(log.startTime)
      setDate(toDateInput(start))
      setStartTime(toTimeInput(start))
      setEndTime(log.endTime ? toTimeInput(new Date(log.endTime)) : "")
    } else {
      setDate(todayISODate())
      setStartTime("")
      setEndTime("")
    }
  }, [open, task, log])

  const selectedTaskId = task?._id ?? taskId
  const selectedProjectId = task?.project ?? (tasks ?? []).find((t) => t._id === taskId)?.project

  const handleSave = () => {
    if (!selectedTaskId || !selectedProjectId || !date || !startTime || !endTime || isPending) return

    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    if (end <= start) {
      toast.error("End time must be after start time")
      return
    }

    if (isEditMode && log) {
      updateTimeLog.mutate(
        {
          id: log._id,
          taskId: selectedTaskId,
          projectId: selectedProjectId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
        {
          onSuccess: () => {
            toast.success("Time entry updated")
            onOpenChange(false)
          },
          onError: (error) => toast.error(error.message),
        }
      )
      return
    }

    createManual.mutate(
      {
        taskId: selectedTaskId,
        projectId: selectedProjectId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Time entry added")
          onOpenChange(false)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  }

  const canSave = Boolean(selectedTaskId && selectedProjectId && date && startTime && endTime) && !isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Time Entry" : "Add Time Entry"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task ? (
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">Task</Label>
              <div className="border border-input rounded-md px-3 py-2 text-sm text-muted-foreground truncate">
                {task.title}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">
                Task <span className="text-destructive">*</span>
              </Label>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {(tasks ?? []).map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.title}
                      {projectById.get(t.project) ? ` · ${projectById.get(t.project)!.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!canSave} onClick={handleSave}>
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Add Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

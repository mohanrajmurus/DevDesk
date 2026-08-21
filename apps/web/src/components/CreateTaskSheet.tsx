import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateTask, useUpdateTask } from "@/features/tasks/queries"
import { TASK_PRIORITIES, TASK_STATUSES } from "@/features/tasks/constants"
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types"
import { useProjects } from "@/features/projects/queries"

interface CreateTaskSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  task?: Task | null
}

export function CreateTaskSheet({ open, onOpenChange, projectId, task }: CreateTaskSheetProps) {
  const isEditMode = Boolean(task)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [dueDate, setDueDate] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("")

  const createTask = useCreateTask()
  const updateTask = useUpdateTask(task?._id ?? "", task?.project)
  const { data: projects } = useProjects()
  const needsProjectPicker = !isEditMode && !projectId
  const isPending = createTask.isPending || updateTask.isPending

  const reset = () => {
    setTitle("")
    setDescription("")
    setStatus("todo")
    setPriority("medium")
    setDueDate("")
    setSelectedProjectId("")
  }

  useEffect(() => {
    if (!open) return
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? "")
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "")
    } else {
      reset()
    }
  }, [open, task])

  const resolvedProjectId = isEditMode ? task!.project : (projectId ?? selectedProjectId)

  const handleSave = () => {
    if (!title.trim() || !resolvedProjectId || isPending) return

    const input = {
      title: title.trim(),
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
    }

    if (task) {
      updateTask.mutate(input, {
        onSuccess: () => {
          toast.success("Task updated successfully")
          onOpenChange(false)
        },
        onError: (error) => toast.error(error.message),
      })
      return
    }

    createTask.mutate(
      { ...input, projectId: resolvedProjectId },
      {
        onSuccess: () => {
          toast.success("Task created successfully")
          reset()
          onOpenChange(false)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full lg:w-[460px] lg:max-w-[460px] p-0 flex flex-col gap-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="text-base">{isEditMode ? "Edit Task" : "Add Task"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5.5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {needsProjectPicker && (
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">
                Project <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
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
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Description</Label>
            <Textarea
              placeholder="Add a short task description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2.5 px-6 py-4 border-t border-border">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button disabled={!title.trim() || !resolvedProjectId || isPending} onClick={handleSave}>
            {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Save Task"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

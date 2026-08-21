import type { TaskPriority, TaskStatus } from "./types"

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
}

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-secondary text-muted-foreground",
  "in-progress": "bg-[#ffefcf] text-[#ab570a]",
  done: "bg-[#e6f4ea] text-[#1a7f3c]",
}

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-secondary text-muted-foreground",
  medium: "bg-[#ffefcf] text-[#ab570a]",
  high: "bg-[#fbe4e1] text-[#b3261e]",
}

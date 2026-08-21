import type { ProjectStatus } from "./types"

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  "on-hold": "On Hold",
  completed: "Completed",
}

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  active: "bg-[#e6f4ea] text-[#1a7f3c]",
  "on-hold": "bg-[#ffefcf] text-[#ab570a]",
  completed: "bg-secondary text-muted-foreground",
}

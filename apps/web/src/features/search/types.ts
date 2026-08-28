import type { ProjectColor } from "@/lib/constants"
import type { ProjectStatus } from "@/features/projects/types"
import type { TaskPriority, TaskStatus } from "@/features/tasks/types"

interface SearchProjectRef {
  _id: string
  name: string
  color: ProjectColor
}

export interface SearchProjectResult {
  _id: string
  name: string
  status: ProjectStatus
  color: ProjectColor
}

export interface SearchTaskResult {
  _id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  project: SearchProjectRef
}

export interface SearchNoteResult {
  _id: string
  title: string
  project: SearchProjectRef
}

export interface SearchResults {
  projects: SearchProjectResult[]
  tasks: SearchTaskResult[]
  notes: SearchNoteResult[]
}

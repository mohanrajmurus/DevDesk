import { http } from "@/lib/http"
import type { PaginatedResult } from "@/lib/pagination"
import type { Task, CreateTaskInput, UpdateTaskInput, TaskPriority, TaskStatus } from "./types"

interface ListTasksParams {
  projectId?: string
  status?: TaskStatus
  priority?: TaskPriority
}

export const tasksApi = {
  list: (params?: ListTasksParams) => http.get<Task[]>("/tasks", { params }).then((res) => res.data),

  listPaginated: (params: ListTasksParams & { page: number; pageSize?: number }) =>
    http.get<PaginatedResult<Task>>("/tasks", { params }).then((res) => res.data),

  get: (id: string) => http.get<Task>(`/tasks/${id}`).then((res) => res.data),

  create: (input: CreateTaskInput) => http.post<Task>("/tasks", input).then((res) => res.data),

  update: (id: string, input: UpdateTaskInput) =>
    http.put<Task>(`/tasks/${id}`, input).then((res) => res.data),

  remove: (id: string) => http.delete(`/tasks/${id}`).then(() => undefined),
}

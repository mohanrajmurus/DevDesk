import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tasksApi } from "./api"
import type { CreateTaskInput, TaskPriority, TaskStatus, UpdateTaskInput } from "./types"

interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
}

interface TaskListPage extends TaskFilters {
  page: number
  pageSize?: number
}

const INFINITE_PAGE_SIZE = 20

export const taskKeys = {
  all: ["tasks"] as const,
  filtered: (filters: TaskListPage) => ["tasks", "filtered", filters] as const,
  infinite: (filters: TaskFilters) => ["tasks", "infinite", filters] as const,
  byProject: (projectId: string) => ["tasks", "project", projectId] as const,
  detail: (id: string) => ["tasks", id] as const,
}

export function useTasks(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: () => tasksApi.list(),
    enabled: options?.enabled ?? true,
  })
}

export function useFilteredTasks(filters: TaskListPage, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.filtered(filters),
    queryFn: () => tasksApi.listPaginated(filters),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  })
}

export function useInfiniteTasks(filters: TaskFilters, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: taskKeys.infinite(filters),
    queryFn: ({ pageParam }) => tasksApi.listPaginated({ ...filters, page: pageParam, pageSize: INFINITE_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: options?.enabled ?? true,
  })
}

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => tasksApi.list({ projectId }),
    enabled: Boolean(projectId),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(variables.projectId) })
    },
  })
}

export function useUpdateTask(id: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => tasksApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
      if (projectId) queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

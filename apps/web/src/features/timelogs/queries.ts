import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { timelogsApi } from "./api"
import { taskKeys } from "@/features/tasks/queries"

interface TimeLogFilters {
  month?: string
  projectId?: string
}

interface TimeLogListPage extends TimeLogFilters {
  page: number
  pageSize?: number
}

const INFINITE_PAGE_SIZE = 20

export const timeLogKeys = {
  all: ["timelogs"] as const,
  filtered: (filters: TimeLogListPage) => ["timelogs", "filtered", filters] as const,
  infinite: (filters: TimeLogFilters) => ["timelogs", "infinite", filters] as const,
  byTask: (taskId: string) => ["timelogs", "task", taskId] as const,
  byProject: (projectId: string) => ["timelogs", "project", projectId] as const,
  active: ["timelogs", "active"] as const,
}

export function useAllTimeLogs() {
  return useQuery({
    queryKey: timeLogKeys.all,
    queryFn: () => timelogsApi.list(),
  })
}

export function useTimeLogs(filters: TimeLogListPage, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: timeLogKeys.filtered(filters),
    queryFn: () => timelogsApi.listPaginated(filters),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  })
}

export function useInfiniteTimeLogs(filters: TimeLogFilters, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: timeLogKeys.infinite(filters),
    queryFn: ({ pageParam }) => timelogsApi.listPaginated({ ...filters, page: pageParam, pageSize: INFINITE_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: options?.enabled ?? true,
  })
}

export function useActiveTimer() {
  return useQuery({
    queryKey: timeLogKeys.active,
    queryFn: () => timelogsApi.getActive(),
  })
}

export function useTaskTimeLogs(taskId: string) {
  return useQuery({
    queryKey: timeLogKeys.byTask(taskId),
    queryFn: () => timelogsApi.list({ taskId }),
    enabled: Boolean(taskId),
  })
}

export function useProjectTimeLogs(projectId: string) {
  return useQuery({
    queryKey: timeLogKeys.byProject(projectId),
    queryFn: () => timelogsApi.list({ projectId }),
    enabled: Boolean(projectId),
  })
}

export function useStartTimer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; projectId: string }) => timelogsApi.start(taskId),
    onSuccess: (_data, { taskId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.active })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.all })
      // Starting a timer may flip the task's status from "todo" to "in-progress" server-side.
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useStopTimer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string; projectId: string }) => timelogsApi.stop(id),
    onSuccess: (_data, { taskId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.active })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.all })
    },
  })
}

export function useCreateManualTimeLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, startTime, endTime }: { taskId: string; projectId: string; startTime: string; endTime: string }) =>
      timelogsApi.createManual({ taskId, startTime, endTime }),
    onSuccess: (_data, { taskId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.all })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })
}

export function useUpdateTimeLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, startTime, endTime }: { id: string; taskId: string; projectId: string; startTime: string; endTime: string }) =>
      timelogsApi.update(id, { startTime, endTime }),
    onSuccess: (_data, { taskId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.all })
    },
  })
}

export function useDeleteTimeLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string; projectId: string }) => timelogsApi.remove(id),
    onSuccess: (_data, { taskId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.byProject(projectId) })
      queryClient.invalidateQueries({ queryKey: timeLogKeys.all })
    },
  })
}

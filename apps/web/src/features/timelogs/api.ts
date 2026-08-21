import { http } from "@/lib/http"
import type { PaginatedResult } from "@/lib/pagination"
import type { TimeLog } from "./types"

interface ListTimeLogsParams {
  taskId?: string
  projectId?: string
  month?: string
}

interface ExportTimeLogsParams {
  month?: string
  projectId?: string
}

export const timelogsApi = {
  list: (params?: ListTimeLogsParams) =>
    http.get<TimeLog[]>("/timelogs", { params }).then((res) => res.data),

  listPaginated: (params: ListTimeLogsParams & { page: number; pageSize?: number }) =>
    http.get<PaginatedResult<TimeLog>>("/timelogs", { params }).then((res) => res.data),

  getActive: () => http.get<TimeLog | null>("/timelogs/active").then((res) => res.data),

  exportExcel: (params?: ExportTimeLogsParams) =>
    http.get<Blob>("/timelogs/export", { params, responseType: "blob" }),

  start: (taskId: string) => http.post<TimeLog>("/timelogs", { taskId }).then((res) => res.data),

  stop: (id: string) => http.post<TimeLog>(`/timelogs/${id}/stop`).then((res) => res.data),

  createManual: (input: { taskId: string; startTime: string; endTime: string }) =>
    http.post<TimeLog>("/timelogs/manual", input).then((res) => res.data),

  update: (id: string, input: { startTime: string; endTime: string }) =>
    http.put<TimeLog>(`/timelogs/${id}`, input).then((res) => res.data),

  remove: (id: string) => http.delete(`/timelogs/${id}`),
}

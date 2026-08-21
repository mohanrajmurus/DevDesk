import { http } from "@/lib/http"
import type { Project, CreateProjectInput } from "./types"

export const projectsApi = {
  list: () => http.get<Project[]>("/projects").then((res) => res.data),

  get: (id: string) => http.get<Project>(`/projects/${id}`).then((res) => res.data),

  create: (input: CreateProjectInput) => http.post<Project>("/projects", input).then((res) => res.data),

  update: (id: string, input: CreateProjectInput) =>
    http.put<Project>(`/projects/${id}`, input).then((res) => res.data),

  remove: (id: string) => http.delete(`/projects/${id}`).then(() => undefined),
}

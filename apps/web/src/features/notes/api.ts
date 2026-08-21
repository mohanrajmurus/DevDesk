import { http } from "@/lib/http"
import type { Note, CreateNoteInput, UpdateNoteInput } from "./types"

export const notesApi = {
  list: (projectId?: string) =>
    http.get<Note[]>("/notes", { params: projectId ? { projectId } : undefined }).then((res) => res.data),

  get: (id: string) => http.get<Note>(`/notes/${id}`).then((res) => res.data),

  create: (input: CreateNoteInput) => http.post<Note>("/notes", input).then((res) => res.data),

  update: (id: string, input: UpdateNoteInput) =>
    http.put<Note>(`/notes/${id}`, input).then((res) => res.data),
}

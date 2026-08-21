import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notesApi } from "./api"
import type { CreateNoteInput, UpdateNoteInput } from "./types"

export const noteKeys = {
  all: ["notes"] as const,
  byProject: (projectId: string) => ["notes", "project", projectId] as const,
  detail: (id: string) => ["notes", id] as const,
}

export function useNotes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: () => notesApi.list(),
    enabled: options?.enabled ?? true,
  })
}

export function useProjectNotes(projectId: string) {
  return useQuery({
    queryKey: noteKeys.byProject(projectId),
    queryFn: () => notesApi.list(projectId),
    enabled: Boolean(projectId),
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesApi.get(id),
    enabled: Boolean(id),
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesApi.create(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
      queryClient.invalidateQueries({ queryKey: noteKeys.byProject(variables.projectId) })
    },
  })
}

export function useUpdateNote(id: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => notesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) })
      if (projectId) queryClient.invalidateQueries({ queryKey: noteKeys.byProject(projectId) })
    },
  })
}

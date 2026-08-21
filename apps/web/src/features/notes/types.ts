export interface Note {
  _id: string
  title: string
  content: string
  project: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteInput {
  title: string
  content: string
  projectId: string
}

export interface UpdateNoteInput {
  title: string
  content: string
}

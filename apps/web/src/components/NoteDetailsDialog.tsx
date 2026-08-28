import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/RichTextEditor"
import { NoteDetailsSkeleton } from "@/components/skeletons"
import { useNote, useUpdateNote } from "@/features/notes/queries"

interface NoteDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteId: string | null
}

export function NoteDetailsDialog({ open, onOpenChange, noteId }: NoteDetailsDialogProps) {
  const { data: note, isLoading } = useNote(noteId ?? "")
  const updateNote = useUpdateNote(note?._id ?? "", note?.project)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    setIsEditing(false)
  }, [open, noteId])

  const startEditing = () => {
    if (!note) return
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(true)
  }

  const isEmpty = !content.replace(/<[^>]*>/g, "").trim()

  const handleSave = () => {
    if (!title.trim() || isEmpty || updateNote.isPending) return
    updateNote.mutate(
      { title: title.trim(), content },
      {
        onSuccess: () => {
          toast.success("Note updated successfully")
          setIsEditing(false)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-[820px] max-h-[88dvh] overflow-y-auto">
        {isLoading && !note && <NoteDetailsSkeleton />}
        {note && (
          <>
            <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0 pr-6">
              {isEditing ? (
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-base font-semibold" />
              ) : (
                <DialogTitle>{note.title}</DialogTitle>
              )}
              {!isEditing && (
                <Button size="sm" className="gap-1.5 pl-2.5 shrink-0" onClick={startEditing}>
                  <Pencil className="size-3.5" strokeWidth={2} />
                  Edit
                </Button>
              )}
            </DialogHeader>

            <RichTextEditor content={isEditing ? content : note.content} onChange={setContent} editable={isEditing} />

            {isEditing && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button disabled={!title.trim() || isEmpty || updateNote.isPending} onClick={handleSave}>
                  {updateNote.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

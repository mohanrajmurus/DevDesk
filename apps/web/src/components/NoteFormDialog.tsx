import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/RichTextEditor"
import { useCreateNote } from "@/features/notes/queries"

interface NoteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function NoteFormDialog({ open, onOpenChange, projectId }: NoteFormDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const createNote = useCreateNote()

  useEffect(() => {
    if (!open) return
    setTitle("")
    setContent("")
  }, [open])

  const isEmpty = !content.replace(/<[^>]*>/g, "").trim()

  const handleSave = () => {
    if (!title.trim() || isEmpty || createNote.isPending) return

    createNote.mutate(
      { title: title.trim(), content, projectId },
      {
        onSuccess: () => {
          toast.success("Note created successfully")
          onOpenChange(false)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-[820px] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="Enter note title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium">
              Content <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor content={content} onChange={setContent} editable />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={!title.trim() || isEmpty || createNote.isPending} onClick={handleSave}>
            {createNote.isPending ? "Saving..." : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

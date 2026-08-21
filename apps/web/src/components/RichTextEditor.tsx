import { useEffect, type ReactNode } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange?: (html: string) => void
  editable: boolean
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"]

export function RichTextEditor({ content, onChange, editable }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-sm max-w-none focus:outline-none text-[13.5px] leading-relaxed min-h-[220px]",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(editable)
  }, [editable, editor])

  useEffect(() => {
    if (!editor) return
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL", previousUrl ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const currentFontSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "16px"
  const currentColor = (editor.getAttributes("textStyle").color as string | undefined) ?? "#000000"

  return (
    <div
      className={cn(
        "rounded-md border border-input",
        editable ? "focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring" : "border-transparent"
      )}
    >
      {editable && (
        <div className="flex items-center gap-1.5 border-b border-input px-2 py-1.5 flex-wrap">
          <Select value={currentFontSize} onValueChange={(v) => editor.chain().focus().setFontSize(v).run()}>
            <SelectTrigger size="sm" className="h-7 w-[76px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size.replace("px", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex items-center justify-center size-7 rounded-md hover:bg-secondary cursor-pointer" title="Text color">
            <span className="size-3.5 rounded-full border border-border" style={{ background: currentColor }} />
            <input
              type="color"
              value={currentColor}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="sr-only"
            />
          </label>

          <div className="w-px h-5 bg-border mx-0.5" />

          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Bold"
          >
            <Bold className="size-3.5" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Italic"
          >
            <Italic className="size-3.5" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("link")}
            onClick={setLink}
            label="Link"
          >
            <LinkIcon className="size-3.5" strokeWidth={2} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-0.5" />

          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="Bullet list"
          >
            <List className="size-3.5" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="Numbered list"
          >
            <ListOrdered className="size-3.5" strokeWidth={2} />
          </ToolbarButton>
        </div>
      )}
      <div className={cn("px-3 py-2.5", !editable && "px-0 py-0")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center size-7 rounded-md transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
      )}
    >
      {children}
    </button>
  )
}

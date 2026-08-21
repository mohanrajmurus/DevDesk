import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Folder, CheckSquare, StickyNote, Loader2, SearchX } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandLoading,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { useSearch } from "@/features/search/queries"
import { useSearchStore } from "@/features/search/store"
import { useProjects } from "@/features/projects/queries"
import { useTasks } from "@/features/tasks/queries"
import { useNotes } from "@/features/notes/queries"
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from "@/features/projects/constants"
import { TASK_STATUS_LABELS, TASK_STATUS_STYLES } from "@/features/tasks/constants"
import { cn } from "@/lib/utils"

export function GlobalSearchTrigger({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const setOpen = useSearchStore((s) => s.setOpen)

  if (iconOnly) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={cn(
          "flex items-center justify-center size-9 rounded-md border border-input bg-background text-muted-foreground hover:bg-secondary transition-colors",
          className
        )}
      >
        <Search className="size-4" strokeWidth={2} />
      </button>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-input bg-background text-[13px] text-muted-foreground hover:bg-secondary transition-colors",
        className
      )}
    >
      <Search className="size-3.5 shrink-0" strokeWidth={2} />
      <span className="flex-1 text-left truncate">Search projects, tasks, notes…</span>
      <kbd className="shrink-0 font-mono text-[10.5px] text-muted-foreground/70 border border-border rounded px-1.5 py-0.5 lg:inline-block hidden">
        Ctrl K
      </kbd>
    </button>
  )
}

export function GlobalSearch() {
  const open = useSearchStore((s) => s.open)
  const setOpen = useSearchStore((s) => s.setOpen)
  const toggle = useSearchStore((s) => s.toggle)
  const [rawQuery, setRawQuery] = useState("")
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggle])

  useEffect(() => {
    const timer = setTimeout(() => setQuery(rawQuery), 300)
    return () => clearTimeout(timer)
  }, [rawQuery])

  useEffect(() => {
    if (!open) {
      setRawQuery("")
      setQuery("")
    }
  }, [open])

  const { data: results, isFetching } = useSearch(query)
  const hasRawQuery = rawQuery.trim().length >= 2
  const hasQuery = query.trim().length >= 2
  const hasResults = Boolean(results && (results.projects.length || results.tasks.length || results.notes.length))
  // Covers both the debounce window (rawQuery has outrun query) and the actual request in flight.
  const isSearching = hasRawQuery && (rawQuery !== query || isFetching)
  const showEmptyState = hasQuery && !isSearching && !hasResults

  // Already fetched app-wide (AppShell's sidebar), free to reuse here.
  const { data: allProjects } = useProjects()
  // Only worth fetching once we actually need suggestions to fill the empty state.
  const { data: allTasks } = useTasks({ enabled: showEmptyState })
  const { data: allNotes } = useNotes({ enabled: showEmptyState })
  const projectById = new Map((allProjects ?? []).map((p) => [p._id, p]))

  const suggestedProjects = (allProjects ?? []).slice(0, 3)
  const suggestedTasks = (allTasks ?? []).slice(0, 3)
  const suggestedNotes = (allNotes ?? []).slice(0, 3)

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search projects, tasks, and notes">
        <CommandInput placeholder="Search projects, tasks, notes…" value={rawQuery} onValueChange={setRawQuery} />
        <CommandList>
          {isSearching && (
            <CommandLoading>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                Searching…
              </div>
            </CommandLoading>
          )}

          {showEmptyState && (
            <>
              <div className="flex flex-col items-center gap-1.5 pt-8 pb-5 px-4 text-center">
                <SearchX className="size-6 text-muted-foreground/40" strokeWidth={1.5} />
                <p className="text-[13px] text-foreground font-medium">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[12px] text-muted-foreground">Try a different term, or jump to one of these</p>
              </div>

              {suggestedProjects.length > 0 && (
                <CommandGroup heading="Projects">
                  {suggestedProjects.map((p) => (
                    <CommandItem
                      key={p._id}
                      value={`sp-${p._id}`}
                      onSelect={() => go(`/projects/${p._id}`)}
                    >
                      <Folder className="size-4" strokeWidth={2} style={{ color: p.color.hex }} />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_STYLES[p.status]}`}
                      >
                        {PROJECT_STATUS_LABELS[p.status]}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {suggestedTasks.length > 0 && (
                <CommandGroup heading="Tasks">
                  {suggestedTasks.map((t) => (
                    <CommandItem
                      key={t._id}
                      value={`st-${t._id}`}
                      onSelect={() => go(`/projects/${t.project}?tab=tasks&task=${t._id}`)}
                    >
                      <CheckSquare className="size-4" strokeWidth={2} />
                      <span className="flex-1 truncate">{t.title}</span>
                      {projectById.get(t.project) && (
                        <span className="shrink-0 text-[11px] text-muted-foreground truncate max-w-[100px]">
                          {projectById.get(t.project)!.name}
                        </span>
                      )}
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_STATUS_STYLES[t.status]}`}
                      >
                        {TASK_STATUS_LABELS[t.status]}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {suggestedNotes.length > 0 && (
                <CommandGroup heading="Notes">
                  {suggestedNotes.map((n) => (
                    <CommandItem
                      key={n._id}
                      value={`sn-${n._id}`}
                      onSelect={() => go(`/projects/${n.project}?tab=notes&note=${n._id}`)}
                    >
                      <StickyNote className="size-4" strokeWidth={2} />
                      <span className="flex-1 truncate">{n.title}</span>
                      {projectById.get(n.project) && (
                        <span className="shrink-0 text-[11px] text-muted-foreground truncate max-w-[100px]">
                          {projectById.get(n.project)!.name}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}

          {!isSearching && results && results.projects.length > 0 && (
            <CommandGroup heading="Projects">
              {results.projects.map((p) => (
                <CommandItem key={p._id} value={`project-${p._id}-${p.name}`} onSelect={() => go(`/projects/${p._id}`)}>
                  <Folder className="size-4" strokeWidth={2} style={{ color: p.color.hex }} />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_STYLES[p.status]}`}
                  >
                    {PROJECT_STATUS_LABELS[p.status]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!isSearching && results && results.tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {results.tasks.map((t) => (
                <CommandItem
                  key={t._id}
                  value={`task-${t._id}-${t.title}`}
                  onSelect={() => go(`/projects/${t.project._id}?tab=tasks&task=${t._id}`)}
                >
                  <CheckSquare className="size-4" strokeWidth={2} />
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground truncate max-w-[100px]">
                    {t.project.name}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_STATUS_STYLES[t.status]}`}
                  >
                    {TASK_STATUS_LABELS[t.status]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!isSearching && results && results.notes.length > 0 && (
            <CommandGroup heading="Notes">
              {results.notes.map((n) => (
                <CommandItem
                  key={n._id}
                  value={`note-${n._id}-${n.title}`}
                  onSelect={() => go(`/projects/${n.project._id}?tab=notes&note=${n._id}`)}
                >
                  <StickyNote className="size-4" strokeWidth={2} />
                  <span className="flex-1 truncate">{n.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground truncate max-w-[100px]">
                    {n.project.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
  )
}

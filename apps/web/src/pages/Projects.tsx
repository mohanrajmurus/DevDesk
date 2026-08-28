import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Pencil, Search, Trash2 } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { CreateProjectSheet } from "@/components/CreateProjectSheet"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectsGridSkeleton } from "@/components/skeletons"
import { useDeleteProject, useProjects } from "@/features/projects/queries"
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from "@/features/projects/constants"
import type { Project, ProjectStatus } from "@/features/projects/types"

type FilterValue = "all" | ProjectStatus

const STAT_LABELS = ["Tasks", "Notes", "Events", "Time"] as const

export default function Projects() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteProject = useDeleteProject()

  const filtered = useMemo(() => {
    const list = projects ?? []
    const query = search.trim().toLowerCase()
    return list.filter((p) => {
      const matchesStatus = filter === "all" || p.status === filter
      const matchesSearch = !query || p.name.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [projects, search, filter])

  const openEdit = (project: Project) => {
    setEditingProject(project)
    setEditSheetOpen(true)
  }

  const openDelete = (project: Project) => {
    setDeletingProject(project)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deletingProject) return
    deleteProject.mutate(deletingProject._id, {
      onSuccess: () => {
        toast.success("Project deleted")
        setDeleteDialogOpen(false)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <AppShell active="projects">
      <div className="mb-5.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight mb-1">Projects</h1>
          <p className="text-[13.5px] text-muted-foreground">{(projects ?? []).length} projects total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full lg:w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/70" />
            <Input
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <ProjectsGridSkeleton />
      ) : filtered.length === 0 ? (
        <p className="text-center text-[13.5px] text-muted-foreground/70 mt-16">
          {search.trim() ? `No projects match "${search.trim()}".` : "No projects yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="relative border border-border rounded-xl px-4 py-3.5 bg-card cursor-pointer hover:border-foreground/20 transition-colors"
            >
              <div className="absolute top-3.5 right-3.5 flex items-center gap-2.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(project)
                  }}
                  aria-label="Edit project"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <Pencil className="size-3.5" strokeWidth={2} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openDelete(project)
                  }}
                  aria-label="Delete project"
                  className="text-muted-foreground/60 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                </button>
              </div>

              <div className="flex items-center gap-2 pr-6">
                <span className="size-2 rounded-full shrink-0" style={{ background: project.color.hex }} />
                <span className="font-semibold text-[14.5px] tracking-tight truncate">{project.name}</span>
              </div>

              <span
                className={`inline-block mt-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_STYLES[project.status]}`}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </span>

              {project.description && (
                <p className="text-[12.5px] text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
              )}

              <div className="grid grid-cols-4 gap-1 mt-3.5 pt-3 border-t border-border text-center">
                {STAT_LABELS.map((label) => (
                  <div key={label}>
                    <div className="font-semibold text-[14px]">—</div>
                    <div className="text-muted-foreground/70 text-[10.5px] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectSheet open={editSheetOpen} onOpenChange={setEditSheetOpen} project={editingProject} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete this project?"
        description={
          deletingProject ? `"${deletingProject.name}" and all of its tasks will be deleted.` : undefined
        }
        onConfirm={handleDelete}
        isPending={deleteProject.isPending}
      />
    </AppShell>
  )
}

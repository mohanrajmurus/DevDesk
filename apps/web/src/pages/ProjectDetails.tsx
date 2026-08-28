import { useEffect, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckSquare,
  StickyNote,
  CalendarDays,
  Clock,
  Plus,
} from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { CreateProjectSheet } from "@/components/CreateProjectSheet"
import { CreateTaskSheet } from "@/components/CreateTaskSheet"
import { TaskDetailsDrawer } from "@/components/TaskDetailsDrawer"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { NoteFormDialog } from "@/components/NoteFormDialog"
import { NoteDetailsDialog } from "@/components/NoteDetailsDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDeleteProject, useProject } from "@/features/projects/queries"
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from "@/features/projects/constants"
import { useProjectTasks } from "@/features/tasks/queries"
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_STYLES, TASK_STATUS_LABELS, TASK_STATUS_STYLES } from "@/features/tasks/constants"
import { useProjectTimeLogs } from "@/features/timelogs/queries"
import { useProjectNotes } from "@/features/notes/queries"
import { formatMinutes } from "@/lib/constants"

const NON_TASK_TABS = [
  { value: "events", label: "Events", icon: CalendarDays, empty: "No events yet for this project." },
] as const

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "tasks")
  const { data: project, isLoading } = useProject(id ?? "")
  const { data: tasks } = useProjectTasks(id ?? "")
  const { data: timelogs } = useProjectTimeLogs(id ?? "")
  const { data: notes } = useProjectNotes(id ?? "")
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createNoteOpen, setCreateNoteOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const deleteProject = useDeleteProject()

  useEffect(() => {
    const taskParam = searchParams.get("task")
    const noteParam = searchParams.get("note")
    if (taskParam) setSelectedTaskId(taskParam)
    if (noteParam) setSelectedNoteId(noteParam)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = () => {
    if (!project) return
    deleteProject.mutate(project._id, {
      onSuccess: () => {
        toast.success("Project deleted")
        navigate("/projects")
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const taskTitleById = new Map((tasks ?? []).map((task) => [task._id, task.title]))
  const totalMinutes = (timelogs ?? []).reduce((sum, log) => {
    if (!log.endTime) return sum
    return sum + Math.max(0, Math.round((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 60000))
  }, 0)

  if (!isLoading && !project) {
    return (
      <AppShell active="projects">
        <p className="text-center text-[13.5px] text-muted-foreground/70 mt-16">
          Project not found.{" "}
          <Link to="/projects" className="underline">
            Back to projects
          </Link>
        </p>
      </AppShell>
    )
  }

  const statItems = [
    { label: "Tasks", value: tasks ? String(tasks.length) : "—" },
    { label: "Notes", value: notes ? String(notes.length) : "—" },
    { label: "Events", value: "—" },
    { label: "Time", value: timelogs ? formatMinutes(totalMinutes) : "—" },
  ]

  return (
    <AppShell active="projects">
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        Back to projects
      </button>

      {project && (
        <>
          <div className="flex flex-col gap-3 mb-5.5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="size-3 rounded-full shrink-0" style={{ background: project.color.hex }} />
              <div>
                <h1 className="text-[26px] font-semibold tracking-tight leading-tight">{project.name}</h1>
                <span
                  className={`inline-block mt-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_STYLES[project.status]}`}
                >
                  {PROJECT_STATUS_LABELS[project.status]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditSheetOpen(true)}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-3.5" strokeWidth={2} />
                Edit
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3.5" strokeWidth={2} />
                Delete
              </button>
            </div>
          </div>

          {project.description && (
            <p className="text-[13.5px] text-muted-foreground max-w-[720px] mb-6">{project.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
            {statItems.map((stat) => (
              <div key={stat.label} className="border border-border rounded-xl px-4 py-3.5 bg-card text-center">
                <div className="font-semibold text-[20px]">{stat.value}</div>
                <div className="text-muted-foreground/70 text-[11px] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {(project.clientName || project.phone || project.email || project.address || project.country) && (
            <div className="border border-border rounded-xl p-6 max-w-[520px] mb-6">
              <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70 mb-4">
                Client Details
              </div>
              <div className="space-y-3">
                {project.clientName && (
                  <div className="flex items-center gap-2.5 text-[13.5px]">
                    <Building2 className="size-3.5 text-muted-foreground/70 shrink-0" strokeWidth={2} />
                    {project.clientName}
                  </div>
                )}
                {project.phone && (
                  <div className="flex items-center gap-2.5 text-[13.5px]">
                    <Phone className="size-3.5 text-muted-foreground/70 shrink-0" strokeWidth={2} />
                    {project.countryCode} {project.phone}
                  </div>
                )}
                {project.email && (
                  <div className="flex items-center gap-2.5 text-[13.5px]">
                    <Mail className="size-3.5 text-muted-foreground/70 shrink-0" strokeWidth={2} />
                    {project.email}
                  </div>
                )}
                {project.address && (
                  <div className="flex items-start gap-2.5 text-[13.5px]">
                    <MapPin className="size-3.5 text-muted-foreground/70 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="whitespace-pre-line">{project.address}</span>
                  </div>
                )}
                {project.country && (
                  <div className="flex items-center gap-2.5 text-[13.5px]">
                    <span className="shrink-0">{project.country.flag}</span>
                    {project.country.name}
                  </div>
                )}
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TabsList>
                <TabsTrigger value="tasks">
                  <CheckSquare />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <StickyNote />
                  Notes
                </TabsTrigger>
                {NON_TASK_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    <tab.icon />
                    {tab.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="timelogs">
                  <Clock />
                  Timelogs
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tasks">
              <div className="flex justify-end mb-3">
                <Button size="sm" className="gap-1.5 pl-2.5" onClick={() => setCreateTaskOpen(true)}>
                  <Plus className="size-3.5" strokeWidth={2.5} />
                  Add Task
                </Button>
              </div>

              {tasks && tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="border border-border rounded-xl px-4 py-3 bg-card flex flex-col gap-2 cursor-pointer hover:border-foreground/20 transition-colors lg:flex-row lg:items-center lg:gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium truncate">{task.title}</div>
                        {task.description && (
                          <p className="text-[12.5px] text-muted-foreground mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {task.dueDate && (
                          <span className="text-[11.5px] text-muted-foreground/70 shrink-0">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_PRIORITY_STYLES[task.priority]}`}
                        >
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TASK_STATUS_STYLES[task.status]}`}
                        >
                          {TASK_STATUS_LABELS[task.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-border rounded-xl py-14 text-center">
                  <p className="text-[13.5px] text-muted-foreground/70">No tasks yet for this project.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes">
              <div className="flex justify-end mb-3">
                <Button size="sm" className="gap-1.5 pl-2.5" onClick={() => setCreateNoteOpen(true)}>
                  <Plus className="size-3.5" strokeWidth={2.5} />
                  Add Note
                </Button>
              </div>

              {notes && notes.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {notes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => setSelectedNoteId(note._id)}
                      className="border border-border rounded-xl px-4 py-3.5 bg-card cursor-pointer hover:border-foreground/20 transition-colors"
                    >
                      <div className="text-[13.5px] font-medium truncate">{note.title}</div>
                      <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-3">
                        {stripHtml(note.content)}
                      </p>
                      <div className="text-[11px] text-muted-foreground/60 mt-2.5">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-border rounded-xl py-14 text-center">
                  <p className="text-[13.5px] text-muted-foreground/70">No notes yet for this project.</p>
                </div>
              )}
            </TabsContent>

            {NON_TASK_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <div className="border border-border rounded-xl py-14 text-center">
                  <p className="text-[13.5px] text-muted-foreground/70">{tab.empty}</p>
                </div>
              </TabsContent>
            ))}

            <TabsContent value="timelogs">
              {timelogs && timelogs.length > 0 ? (
                <div className="space-y-2">
                  {timelogs.map((log) => {
                    const start = new Date(log.startTime)
                    const isRunning = !log.endTime
                    const mins = isRunning
                      ? null
                      : Math.max(0, Math.round((new Date(log.endTime!).getTime() - start.getTime()) / 60000))
                    return (
                      <div
                        key={log._id}
                        className="border border-border rounded-xl px-4 py-3 bg-card flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[13.5px] font-medium truncate">
                            {taskTitleById.get(log.task) ?? "Unknown task"}
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-0.5">
                            {start.toLocaleDateString()} ·{" "}
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {!isRunning &&
                              ` – ${new Date(log.endTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                          </div>
                        </div>
                        {isRunning ? (
                          <span className="shrink-0 self-start rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-[#ffefcf] text-[#ab570a] lg:self-auto">
                            Running
                          </span>
                        ) : (
                          <span className="shrink-0 text-[13px] font-medium">{formatMinutes(mins!)}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border border-border rounded-xl py-14 text-center">
                  <p className="text-[13.5px] text-muted-foreground/70">No time logged for this project yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <CreateProjectSheet open={editSheetOpen} onOpenChange={setEditSheetOpen} project={project} />
          <CreateTaskSheet open={createTaskOpen} onOpenChange={setCreateTaskOpen} projectId={project._id} />
          <TaskDetailsDrawer
            open={Boolean(selectedTaskId)}
            onOpenChange={(open) => !open && setSelectedTaskId(null)}
            taskId={selectedTaskId}
          />
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete this project?"
            description={`"${project.name}" and all of its tasks will be deleted.`}
            onConfirm={handleDelete}
            isPending={deleteProject.isPending}
          />
          <NoteFormDialog open={createNoteOpen} onOpenChange={setCreateNoteOpen} projectId={project._id} />
          <NoteDetailsDialog
            open={Boolean(selectedNoteId)}
            onOpenChange={(open) => !open && setSelectedNoteId(null)}
            noteId={selectedNoteId}
          />
        </>
      )}
    </AppShell>
  )
}

import { type ReactNode, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LayoutDashboard, Folder, CheckSquare, Clock, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateProjectSheet } from "@/components/CreateProjectSheet"
import { GlobalSearch, GlobalSearchTrigger } from "@/components/GlobalSearch"
import { MobileBottomNav } from "@/components/MobileBottomNav"
import { useClock } from "@/hooks/use-clock"
import { useLogout, useMe } from "@/features/auth/queries"
import { useProjects } from "@/features/projects/queries"
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from "@/features/projects/constants"
import logo from "@/assets/logo.png"

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { key: "projects", label: "Projects", icon: Folder, to: "/projects" },
  { key: "tasks", label: "Tasks", icon: CheckSquare, to: "/tasks" },
  { key: "timelogs", label: "Time Logs", icon: Clock, to: "/timelogs" },
] as const

interface AppShellProps {
  active: "dashboard" | "projects" | "tasks" | "timelogs" | "profile" | null
  children: ReactNode
}

export function AppShell({ active, children }: AppShellProps) {
  const clockLabel = useClock()
  const navigate = useNavigate()
  const logout = useLogout()
  const { data: meData } = useMe()
  const user = meData?.user
  const displayName = user?.name || "Account"
  const avatarLetter = (user?.name?.trim()[0] || "?").toUpperCase()

  const { data: projectsData } = useProjects()
  const recentProjects = (projectsData ?? []).filter((p) => p.status === "active").slice(0, 4)
  const [projectSheetOpen, setProjectSheetOpen] = useState(false)

  const handleSignOut = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login"),
    })
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground lg:min-w-[1280px]">
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-20 lg:h-[60px] lg:min-w-[1280px] lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-10 w-auto object-contain lg:h-14" />
          <span className="text-lg font-semibold tracking-tight">DevDesk</span>
        </Link>
        <div className="hidden lg:block">
          <GlobalSearchTrigger className="w-[280px]" />
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden lg:inline text-[13px] text-muted-foreground tabular-nums">{clockLabel}</span>
          <Button
            size="sm"
            className="hidden lg:inline-flex gap-1.5 pl-2.5"
            onClick={() => setProjectSheetOpen(true)}
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add Project
          </Button>
          <GlobalSearchTrigger iconOnly className="lg:hidden" />
        </div>
      </header>

      <nav className="hidden lg:flex fixed top-[60px] bottom-0 left-0 w-[228px] bg-background border-r border-border flex-col py-4.5 z-10">
        <div className="flex flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.key === active
            const content = (
              <span
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="size-4" strokeWidth={2} />
                {item.label}
              </span>
            )
            return item.to ? (
              <Link key={item.key} to={item.to}>
                {content}
              </Link>
            ) : (
              <div key={item.key} className="cursor-default">
                {content}
              </div>
            )
          })}
        </div>

        <div className="mt-5.5 px-3">
          <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70 px-2.5 pb-2">
            Recent Projects
          </div>
          {recentProjects.length > 0 ? (
            recentProjects.map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] rounded-md hover:bg-secondary"
              >
                <span className="size-1.5 rounded-full shrink-0" style={{ background: p.color.hex }} />
                <span className="flex-1 truncate">{p.name}</span>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PROJECT_STATUS_STYLES[p.status]}`}
                >
                  {PROJECT_STATUS_LABELS[p.status]}
                </span>
              </Link>
            ))
          ) : (
            <div className="px-2.5 py-1.5 text-[13px] text-muted-foreground/70">No projects yet</div>
          )}
        </div>

        <div className="mt-auto px-3 pt-3.5 border-t border-border">
          <Link to="/profile" className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-secondary">
            <span className="size-6.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-semibold shrink-0">
              {avatarLetter}
            </span>
            <span className="text-[13px] font-medium">{displayName}</span>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={logout.isPending}
            className="w-full flex items-center gap-2 py-1.5 px-1 mt-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="size-3.5" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="mt-14 px-4 pt-4 pb-20 max-w-[1440px] lg:ml-[228px] lg:mt-[60px] lg:px-8 lg:pt-7 lg:pb-16">
        {children}
      </main>

      <MobileBottomNav active={active} />

      <GlobalSearch />
      <CreateProjectSheet open={projectSheetOpen} onOpenChange={setProjectSheetOpen} />
    </div>
  )
}

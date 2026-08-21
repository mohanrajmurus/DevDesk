import { Link } from "react-router-dom"
import { LayoutDashboard, Folder, CheckSquare, Clock, User } from "lucide-react"

const NAV_ITEMS = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard, to: "/dashboard" },
  { key: "projects", label: "Projects", icon: Folder, to: "/projects" },
  { key: "tasks", label: "Tasks", icon: CheckSquare, to: "/tasks" },
  { key: "timelogs", label: "Time Logs", icon: Clock, to: "/timelogs" },
  { key: "profile", label: "Profile", icon: User, to: "/profile" },
] as const

interface MobileBottomNavProps {
  active: "dashboard" | "projects" | "tasks" | "timelogs" | "profile" | null
}

export function MobileBottomNav({ active }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-stretch border-t border-border bg-background lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = item.key === active
        return (
          <Link
            key={item.key}
            to={item.to}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-5" strokeWidth={isActive ? 2.3 : 2} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

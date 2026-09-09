import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  CheckSquare,
  Clock,
  FileText,
  Folder,
  LayoutDashboard,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

const FEATURES = [
  {
    icon: Folder,
    title: "Projects",
    body: "Group everything by client or product. Colour-coded, with status at a glance.",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
    body: "Priorities, due dates, and a focus list that surfaces what actually matters today.",
  },
  {
    icon: Clock,
    title: "Time tracking",
    body: "One-tap timers per task, plus manual entries. Weekly totals roll up by project.",
  },
  {
    icon: FileText,
    title: "Rich notes",
    body: "Formatted notes attached to any project so context never lives in a separate app.",
  },
  {
    icon: Search,
    title: "Global search",
    body: "Jump to any project, task, or note from anywhere with a single keystroke.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "Your day on one screen: due today, high-priority focus, and time logged this week.",
  },
] as const

const STEPS = [
  {
    n: "01",
    title: "Sign in with your phone",
    body: "No passwords. Enter your number, punch in the code, and you're in.",
  },
  {
    n: "02",
    title: "Spin up a project",
    body: "Add your clients or products. Give each one a colour and a status.",
  },
  {
    n: "03",
    title: "Track tasks & log time",
    body: "Break work into tasks, start a timer, and let the dashboard keep score.",
  },
] as const

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70">
      {children}
    </div>
  )
}

function TopNav({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-4 lg:h-16 lg:px-6">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-9 w-auto object-contain lg:h-11" />
          <span className="text-lg font-semibold tracking-tight">DevDesk</span>
        </div>
        <nav className="hidden items-center gap-7 text-[13.5px] text-muted-foreground lg:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
        </nav>
        <Button size="sm" onClick={onGetStarted}>
          Get started
        </Button>
      </div>
    </header>
  )
}

function ProductPreview() {
  return (
    <div className="mx-auto mt-12 max-w-[960px] px-4 lg:mt-16 lg:px-0">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-secondary" />
          <span className="size-2.5 rounded-full bg-secondary" />
          <span className="size-2.5 rounded-full bg-secondary" />
          <span className="ml-3 font-mono text-[11px] text-muted-foreground/70">devdesk.app/dashboard</span>
        </div>
        <div className="flex">
          <div className="hidden w-[180px] shrink-0 flex-col gap-1.5 border-r border-border p-4 sm:flex">
            {["Dashboard", "Projects", "Tasks", "Time Logs"].map((item, i) => (
              <div
                key={item}
                className={`rounded-md px-2.5 py-1.5 text-[12.5px] font-medium ${
                  i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex-1 p-5">
            <div className="mb-1 h-5 w-40 rounded bg-secondary" />
            <div className="mb-5 h-3 w-56 rounded bg-secondary/60" />
            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                { label: "Projects", value: "8" },
                { label: "Tasks", value: "24" },
                { label: "This week", value: "12h 40m" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border px-3 py-2.5">
                  <div className="font-mono text-[9px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {s.label}
                  </div>
                  <div className="mt-1 text-lg font-semibold tracking-tight">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mb-2 h-3 w-32 rounded bg-secondary" />
            <div className="flex flex-col">
              {[70, 55, 82, 40].map((w, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-border py-2.5">
                  <span className="size-[15px] rounded-[4px] border-[1.5px] border-muted-foreground/40" />
                  <span className="h-3 rounded bg-secondary" style={{ width: `${w}%` }} />
                  <span className="ml-auto size-1.5 rounded-full bg-[#0070f3]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const goToLogin = () => navigate("/login")
  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav onGetStarted={goToLogin} />

      {/* Hero */}
      <section className="mx-auto max-w-[1080px] px-4 pt-16 text-center lg:px-6 lg:pt-24">
        <div className="mx-auto flex max-w-[720px] flex-col items-center">
          <Eyebrow>Freelance work, organised</Eyebrow>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-tight lg:text-[52px]">
            Projects, tasks, and time
            <br className="hidden sm:block" /> in one clean workspace.
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-muted-foreground lg:text-base">
            DevDesk keeps every client project, every task, and every logged hour together —
            so you always know what to work on and where your time went.
          </p>
          <div className="mt-8">
            <Button size="lg" className="gap-1.5" onClick={goToLogin}>
              Get started
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </Button>
          </div>
          <p className="mt-3.5 text-[12.5px] text-muted-foreground/70">
            Sign in with your phone — no credit card, no setup.
          </p>
        </div>

        <ProductPreview />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1080px] px-4 pt-24 lg:px-6 lg:pt-32">
        <div className="mx-auto max-w-[560px] text-center">
          <Eyebrow>Everything in one place</Eyebrow>
          <h2 className="mt-3 text-[26px] font-semibold tracking-tight lg:text-[34px]">
            Built for how solo work actually happens
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-xl border border-border bg-card px-5 py-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-4.5 text-foreground" strokeWidth={2} />
                </div>
                <div className="mt-4 text-[15px] font-semibold tracking-tight">{f.title}</div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-[1080px] px-4 pt-24 lg:px-6 lg:pt-32">
        <div className="mx-auto max-w-[560px] text-center">
          <Eyebrow>Three steps</Eyebrow>
          <h2 className="mt-3 text-[26px] font-semibold tracking-tight lg:text-[34px]">
            Up and running in a minute
          </h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="font-mono text-[13px] font-medium text-[#0070f3]">{s.n}</div>
              <div className="mt-2.5 text-[15px] font-semibold tracking-tight">{s.title}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-[1080px] px-4 pt-24 lg:px-6 lg:pt-32">
        <div className="flex flex-col items-center rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground lg:py-20">
          <h2 className="text-[26px] font-semibold tracking-tight lg:text-[34px]">
            Ready to get organised?
          </h2>
          <p className="mt-3 max-w-[440px] text-[14px] text-primary-foreground/70 lg:text-[15px]">
            Start tracking your projects, tasks, and time today.
          </p>
          <Button size="lg" variant="secondary" className="mt-7 gap-1.5" onClick={goToLogin}>
            Get started
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-20 max-w-[1080px] px-4 pb-12 lg:px-6">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-auto object-contain" />
            <span className="text-[15px] font-semibold tracking-tight">DevDesk</span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <button onClick={goToLogin} className="transition-colors hover:text-foreground">
              Get started
            </button>
          </div>
          <div className="text-[12.5px] text-muted-foreground/70">© {year} DevDesk</div>
        </div>
      </footer>
    </div>
  )
}

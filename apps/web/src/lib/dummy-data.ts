export interface ProjectColor {
  name: string
  hex: string
}

export const PROJECT_COLORS: ProjectColor[] = [
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Orange", hex: "#F97316" },
  { name: "Red", hex: "#EF4444" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Gray", hex: "#6B7280" },
]

export interface Country {
  name: string
  flag: string
}

export const COUNTRIES: Country[] = [
  { name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  { name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  { name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  { name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  { name: "United Arab Emirates", flag: "\u{1F1E6}\u{1F1EA}" },
  { name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  { name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  { name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
]

export const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"]

export const HIGH_PRIORITY_FOCUS = [
  { title: "Ship billing export feature", project: "DevDesk", due: "Today", priority: "High" as const },
  { title: "Resolve client escalation", project: "Limesoda", due: "Tomorrow", priority: "High" as const },
  { title: "Finalize contract renewal", project: "Portfolio", due: "Aug 05", priority: "High" as const },
  { title: "Migrate database schema", project: "DevDesk", due: "Aug 06", priority: "High" as const },
]

export const TODAY_EVENTS = [
  { time: "10:30 AM", title: "Project Planning", project: "DevDesk", projectColor: "#3B82F6", duration: "30m" },
  { time: "02:00 PM", title: "Client Call", project: "Limesoda", projectColor: "#22C55E", duration: "45m" },
  { time: "05:30 PM", title: "Weekly Review", project: null, projectColor: null, duration: null },
]

export const UPCOMING_GROUPS = [
  { date: "Aug 04", items: [{ time: "11:00 AM", title: "Product Review", project: "DevDesk", projectColor: "#3B82F6" }] },
  {
    date: "Aug 06",
    items: [
      { time: "03:30 PM", title: "Deployment", project: "DevDesk", projectColor: "#3B82F6" },
      { time: "05:00 PM", title: "Portfolio Shoot", project: "Portfolio", projectColor: "#A855F7" },
    ],
  },
  { date: "Aug 08", items: [{ time: "09:00 AM", title: "Client Kickoff", project: "Limesoda", projectColor: "#22C55E" }] },
]

export function formatMinutes(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function formatClock(now: Date) {
  const hh = now.getHours()
  const mm = now.getMinutes()
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`
}

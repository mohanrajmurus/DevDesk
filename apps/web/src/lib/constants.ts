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

export function formatMinutes(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function formatClock(now: Date) {
  const hh = now.getHours()
  const mm = now.getMinutes()
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`
}

export type TimeLogSource = "timer" | "manual"

export interface TimeLog {
  _id: string
  task: string
  project: string
  startTime: string
  endTime?: string
  source: TimeLogSource
}

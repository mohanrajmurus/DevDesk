import type { ProjectColor, Country } from "@/lib/dummy-data"

export type ProjectStatus = "active" | "on-hold" | "completed"

export interface Project {
  _id: string
  name: string
  description: string
  status: ProjectStatus
  color: ProjectColor
  clientName?: string
  countryCode?: string
  phone?: string
  email?: string
  address?: string
  country?: Country
  owner: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  description?: string
  status?: ProjectStatus
  color: ProjectColor
  clientName?: string
  countryCode?: string
  phone?: string
  email?: string
  address?: string
  country?: Country
}

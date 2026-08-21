import axios, { type AxiosError } from "axios"
import { queryClient } from "./query-client"

interface ApiErrorBody {
  error?: string
  fields?: Record<string, string>
}

export class ApiError extends Error {
  fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message)
    this.name = "ApiError"
    this.fields = fields
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
})

let loggingOut = false

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && !loggingOut && window.location.pathname !== "/login") {
      loggingOut = true
      queryClient.clear()
      // Bare axios, not `http` — avoids re-entering this same interceptor.
      await axios
        .post(`${http.defaults.baseURL}/auth/logout`, undefined, { withCredentials: true })
        .catch(() => {})
      window.location.href = "/login"
    }

    const body = error.response?.data
    return Promise.reject(new ApiError(body?.error ?? error.message, body?.fields))
  }
)

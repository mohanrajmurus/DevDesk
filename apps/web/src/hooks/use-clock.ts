import { useEffect, useState } from "react"
import { formatClock } from "@/lib/constants"

export function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return formatClock(now)
}

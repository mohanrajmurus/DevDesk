import { useCallback, useRef, useState, type PointerEvent } from "react"

const CLOSE_DISTANCE_PX = 120
const CLOSE_VELOCITY_PX_MS = 0.5

export function useSwipeToClose(onClose: () => void) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const startTimeRef = useRef(0)

  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    startYRef.current = e.clientY
    startTimeRef.current = performance.now()
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!isDragging) return
      const delta = e.clientY - startYRef.current
      if (delta > 0) setDragY(delta)
    },
    [isDragging]
  )

  const endDrag = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const elapsed = Math.max(1, performance.now() - startTimeRef.current)
    const velocity = dragY / elapsed
    if (dragY > CLOSE_DISTANCE_PX || velocity > CLOSE_VELOCITY_PX_MS) {
      onClose()
    }
    setDragY(0)
  }, [isDragging, dragY, onClose])

  return {
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    contentStyle:
      dragY > 0
        ? { transform: `translateY(${dragY}px)`, transition: isDragging ? "none" : "transform 200ms ease-out" }
        : undefined,
  }
}

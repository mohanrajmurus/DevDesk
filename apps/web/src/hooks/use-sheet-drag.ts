import { useCallback, useRef, useState, type PointerEvent } from "react"

const CLOSE_DISTANCE_PX = 110
const CLOSE_VELOCITY_PX_MS = 0.5
const EXPAND_DISTANCE_PX = 44
const EXPAND_VELOCITY_PX_MS = 0.35

/**
 * Drag behaviour for a mobile bottom sheet's grab handle:
 *  - from the default height, drag up past a threshold to expand to full height
 *  - from expanded, drag down to collapse back to the default height
 *  - drag down past a larger threshold (or flick) to close
 *
 * `expanded` is meant to drive a `data-expanded` attribute on the sheet so CSS
 * can bump its height; `contentStyle` follows the finger for the downward /
 * close drag and gives a small rubber-band on the upward pull.
 */
export function useSheetDrag(onClose: () => void) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const startYRef = useRef(0)
  const startTimeRef = useRef(0)
  const expandedAtStartRef = useRef(false)

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      startYRef.current = e.clientY
      startTimeRef.current = performance.now()
      expandedAtStartRef.current = expanded
      setIsDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [expanded]
  )

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!isDragging) return
      const delta = e.clientY - startYRef.current
      // When already expanded, only downward drags do anything.
      setDragY(expandedAtStartRef.current ? Math.max(0, delta) : delta)
    },
    [isDragging]
  )

  const endDrag = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const elapsed = Math.max(1, performance.now() - startTimeRef.current)
    const velocity = dragY / elapsed

    if (expandedAtStartRef.current) {
      if (dragY > CLOSE_DISTANCE_PX * 1.6 || velocity > CLOSE_VELOCITY_PX_MS * 1.5) {
        onClose()
      } else if (dragY > EXPAND_DISTANCE_PX) {
        setExpanded(false)
      }
    } else {
      if (dragY > CLOSE_DISTANCE_PX || velocity > CLOSE_VELOCITY_PX_MS) {
        onClose()
      } else if (dragY < -EXPAND_DISTANCE_PX || velocity < -EXPAND_VELOCITY_PX_MS) {
        setExpanded(true)
      }
    }
    setDragY(0)
  }, [isDragging, dragY, onClose])

  let contentStyle: { transform: string; transition: string } | undefined
  if (dragY > 0) {
    contentStyle = {
      transform: `translateY(${dragY}px)`,
      transition: isDragging ? "none" : "transform 200ms ease-out",
    }
  } else if (isDragging && dragY < 0 && !expanded) {
    // Rubber-band the upward pull so the gesture feels connected.
    contentStyle = { transform: `translateY(${Math.max(dragY / 3, -28)}px)`, transition: "none" }
  }

  return {
    expanded,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    contentStyle,
  }
}

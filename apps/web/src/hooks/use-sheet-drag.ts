import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"

const CLOSE_DISTANCE_PX = 108
const CLOSE_VELOCITY_PX_MS = 0.55
const EXPAND_DISTANCE_PX = 44
const EXPAND_VELOCITY_PX_MS = 0.35

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SETTLE_MS = 260
const SETTLE_TRANSITION = `transform ${SETTLE_MS}ms ${EASE}, height ${SETTLE_MS}ms ${EASE}, max-height ${SETTLE_MS}ms ${EASE}`

/**
 * Drag behaviour for a mobile bottom sheet's grab handle.
 *
 *  - from the default height, drag up past a threshold to expand to full height
 *  - from expanded, drag down to collapse back
 *  - drag down far / flick down to close
 *
 * The finger-follow is done imperatively on the element's `style.transform` so
 * there is no React render per pointer event — that is what keeps it smooth.
 * React state only holds `expanded`, committed once on release.
 */
export function useSheetDrag(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const drag = useRef({ active: false, startY: 0, startTime: 0, dy: 0, wasExpanded: false })

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const el = ref.current
      if (!el) return
      clearTimeout(clearTimer.current)
      drag.current = {
        active: true,
        startY: e.clientY,
        startTime: performance.now(),
        dy: 0,
        wasExpanded: expanded,
      }
      el.style.transition = "none"
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [expanded]
  )

  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const el = ref.current
    const d = drag.current
    if (!d.active || !el) return
    let dy = e.clientY - d.startY
    // Upward: blocked when already expanded, damped otherwise (just a hint).
    if (dy < 0) dy = d.wasExpanded ? 0 : dy * 0.4
    d.dy = dy
    el.style.transform = `translate3d(0, ${Math.max(dy, -72)}px, 0)`
  }, [])

  const settle = useCallback(() => {
    const el = ref.current
    const d = drag.current
    if (!d.active || !el) return
    d.active = false

    const velocity = d.dy / Math.max(1, performance.now() - d.startTime)
    el.style.transition = SETTLE_TRANSITION
    el.style.transform = "translate3d(0, 0, 0)"

    if (d.wasExpanded) {
      if (d.dy > CLOSE_DISTANCE_PX * 1.7 || velocity > CLOSE_VELOCITY_PX_MS * 1.6) onClose()
      else if (d.dy > EXPAND_DISTANCE_PX) setExpanded(false)
    } else if (d.dy > CLOSE_DISTANCE_PX || velocity > CLOSE_VELOCITY_PX_MS) {
      onClose()
    } else if (-d.dy > EXPAND_DISTANCE_PX || -velocity > EXPAND_VELOCITY_PX_MS) {
      setExpanded(true)
    }

    clearTimer.current = setTimeout(() => {
      if (!drag.current.active && ref.current) {
        ref.current.style.transition = ""
        ref.current.style.transform = ""
      }
    }, SETTLE_MS + 40)
  }, [onClose])

  useEffect(() => () => clearTimeout(clearTimer.current), [])

  return {
    expanded,
    ref,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: settle,
      onPointerCancel: settle,
    },
  }
}

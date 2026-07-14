import { useEffect, useRef, type RefObject } from 'react'

import type { CalendarView } from '@/features/calendar'
import {
  getPinchZoomDirection,
  getWheelZoomDirection,
  getZoomedView,
} from '@/features/plans/gestures'

const ZOOM_COOLDOWN_MS = 320

function touchDistance(touches: TouchList) {
  const [first, second] = [touches[0], touches[1]]
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
}

export function useCalendarZoom(
  surfaceRef: RefObject<HTMLElement | null>,
  view: CalendarView,
  onViewChange: (view: CalendarView) => void,
  onZoomStart: () => void,
) {
  const latestView = useRef(view)
  const latestOnViewChange = useRef(onViewChange)
  const latestOnZoomStart = useRef(onZoomStart)

  latestView.current = view
  latestOnViewChange.current = onViewChange
  latestOnZoomStart.current = onZoomStart

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return

    let initialDistance: number | null = null
    let gestureActive = false
    let wheelDelta = 0
    let wheelLocked = false
    let wheelTimer: ReturnType<typeof setTimeout> | undefined
    let lastZoomAt = 0
    let zoomLocked = false

    const applyZoom = (direction: 'in' | 'out') => {
      const now = Date.now()
      if (now - lastZoomAt < ZOOM_COOLDOWN_MS) return
      const nextView = getZoomedView(latestView.current, direction)
      if (nextView === latestView.current) return
      lastZoomAt = now
      latestOnViewChange.current(nextView)
    }

    const startTouch = (event: TouchEvent) => {
      if (event.touches.length < 2) return
      if (initialDistance !== null || gestureActive) return
      initialDistance = touchDistance(event.touches)
      zoomLocked = false
      latestOnZoomStart.current()
    }

    const moveTouch = (event: TouchEvent) => {
      if (event.touches.length < 2 || initialDistance === null) return
      event.preventDefault()
      if (zoomLocked) return
      const direction = getPinchZoomDirection(initialDistance, touchDistance(event.touches))
      if (!direction) return
      zoomLocked = true
      applyZoom(direction)
    }

    const endTouch = (event: TouchEvent) => {
      if (event.touches.length >= 2) return
      initialDistance = null
      if (!gestureActive) zoomLocked = false
    }

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      latestOnZoomStart.current()
      wheelDelta += event.deltaY

      if (!wheelLocked) {
        const direction = getWheelZoomDirection(wheelDelta)
        if (direction) {
          wheelLocked = true
          applyZoom(direction)
        }
      }

      clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => {
        wheelDelta = 0
        wheelLocked = false
      }, 180)
    }

    const startGesture = (event: Event) => {
      event.preventDefault()
      gestureActive = true
      if (initialDistance !== null) return
      zoomLocked = false
      latestOnZoomStart.current()
    }

    const changeGesture = (event: Event) => {
      event.preventDefault()
      if (zoomLocked) return
      const scale = 'scale' in event && typeof event.scale === 'number' ? event.scale : 1
      const direction = getPinchZoomDirection(100, scale * 100, 12)
      if (!direction) return
      zoomLocked = true
      applyZoom(direction)
    }

    const endGesture = (event: Event) => {
      event.preventDefault()
      gestureActive = false
      if (initialDistance === null) zoomLocked = false
    }

    surface.addEventListener('touchstart', startTouch, { passive: true })
    surface.addEventListener('touchmove', moveTouch, { passive: false })
    surface.addEventListener('touchend', endTouch)
    surface.addEventListener('touchcancel', endTouch)
    surface.addEventListener('wheel', handleWheel, { passive: false })
    surface.addEventListener('gesturestart', startGesture, { passive: false })
    surface.addEventListener('gesturechange', changeGesture, { passive: false })
    surface.addEventListener('gestureend', endGesture, { passive: false })

    return () => {
      clearTimeout(wheelTimer)
      surface.removeEventListener('touchstart', startTouch)
      surface.removeEventListener('touchmove', moveTouch)
      surface.removeEventListener('touchend', endTouch)
      surface.removeEventListener('touchcancel', endTouch)
      surface.removeEventListener('wheel', handleWheel)
      surface.removeEventListener('gesturestart', startGesture)
      surface.removeEventListener('gesturechange', changeGesture)
      surface.removeEventListener('gestureend', endGesture)
    }
  }, [surfaceRef])
}

import { CalendarClock } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'

import {
  clampFabPosition,
  DEFAULT_FAB_POSITION,
  isNormalizedFabPosition,
  normalizeFabPosition,
  type FabPixelPosition,
  type NormalizedFabPosition,
} from '@/features/calendar/today-fab-position'

const STORAGE_KEY = 'rike-today-fab-position'

function readPosition(): NormalizedFabPosition {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return isNormalizedFabPosition(value) ? value : DEFAULT_FAB_POSITION
  } catch {
    return DEFAULT_FAB_POSITION
  }
}

interface DragSession {
  pointerId: number
  startX: number
  startY: number
  startPosition: FabPixelPosition
  moved: boolean
}

export function TodayFab({ onToday }: { onToday: () => void }) {
  const [normalized, setNormalized] = useState(readPosition)
  const normalizedRef = useRef(normalized)
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const session = useRef<DragSession | null>(null)
  const suppressClick = useRef(false)
  const pixels = clampFabPosition(normalized, viewport.width, viewport.height)

  useEffect(() => {
    const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const moveTo = (position: FabPixelPosition) => {
    const nextPixels = clampFabPosition(
      normalizeFabPosition(position, viewport.width, viewport.height),
      viewport.width,
      viewport.height,
    )
    const nextNormalized = normalizeFabPosition(nextPixels, viewport.width, viewport.height)
    normalizedRef.current = nextNormalized
    setNormalized(nextNormalized)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    session.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: pixels,
      moved: false,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = session.current
    if (!current || current.pointerId !== event.pointerId) return
    const deltaX = event.clientX - current.startX
    const deltaY = event.clientY - current.startY
    if (Math.hypot(deltaX, deltaY) > 5) current.moved = true
    if (!current.moved) return
    event.preventDefault()
    moveTo({ left: current.startPosition.left + deltaX, top: current.startPosition.top + deltaY })
  }

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = session.current
    if (!current || current.pointerId !== event.pointerId) return
    session.current = null
    if (!current.moved) return
    suppressClick.current = true
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedRef.current))
    } catch {
      // Keep the current session position when persistence is unavailable.
    }
  }

  return (
    <button
      aria-label="回到今天"
      className="fixed z-50 grid size-12 touch-none place-items-center border border-ink bg-ink text-paper shadow-paper active:scale-95"
      onClick={(event) => {
        if (suppressClick.current) {
          suppressClick.current = false
          event.preventDefault()
          return
        }
        onToday()
      }}
      onPointerCancel={() => { session.current = null }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: pixels.left, top: pixels.top }}
      title="回到今天"
      type="button"
    >
      <CalendarClock aria-hidden="true" size={21} />
    </button>
  )
}

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { canStartDateSwipe, getDateSwipeAmount } from '@/features/plans/gestures'
import { cn } from '@/lib/cn'

export interface PageTurnHandle {
  turn: (amount: -1 | 1) => void
  cancel: () => void
}

interface PageTurnProps {
  children: ReactNode
  className?: string
  onTurn: (amount: -1 | 1) => void
  renderAdjacent: (amount: -1 | 1) => ReactNode
}

interface PointerSession {
  id: number
  startX: number
  startY: number
  lastX: number
  lastTime: number
  velocityX: number
  active: boolean
}

export const PageTurn = forwardRef<PageTurnHandle, PageTurnProps>(function PageTurn(
  { children, className, onTurn, renderAdjacent },
  ref,
) {
  const reduceMotion = useReducedMotion()
  const rotation = useMotionValue(0)
  const shadowOpacity = useTransform(rotation, (value) => Math.sin((Math.abs(value) / 180) * Math.PI) * 0.34)
  const [direction, setDirection] = useState<-1 | 1 | null>(null)
  const [busy, setBusy] = useState(false)
  const session = useRef<PointerSession | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const animationToken = useRef(0)

  const reset = () => {
    rotation.set(0)
    setDirection(null)
    setBusy(false)
    session.current = null
  }

  const finishTurn = (amount: -1 | 1) => {
    if (busy) return
    setBusy(true)
    setDirection(amount)

    if (reduceMotion) {
      onTurn(amount)
      reset()
      return
    }

    const target = amount > 0 ? -180 : 180
    const token = ++animationToken.current
    void animate(rotation, target, { duration: 0.42, ease: [0.22, 0.72, 0.2, 1] }).then(() => {
      if (token !== animationToken.current) return
      onTurn(amount)
      reset()
    })
  }

  const cancel = () => {
    const token = ++animationToken.current
    session.current = null
    if (reduceMotion || rotation.get() === 0) {
      reset()
      return
    }
    setBusy(true)
    void animate(rotation, 0, { type: 'spring', stiffness: 360, damping: 34 }).then(() => {
      if (token === animationToken.current) reset()
    })
  }

  useImperativeHandle(ref, () => ({ turn: finishTurn, cancel }))

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (busy || !canStartDateSwipe(event.target)) return

    if (session.current) {
      cancel()
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    session.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
      active: false,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current
    if (!current || current.id !== event.pointerId || busy) return

    const offsetX = event.clientX - current.startX
    const offsetY = event.clientY - current.startY
    if (!current.active) {
      if (Math.abs(offsetX) < 10) return
      if (Math.abs(offsetX) <= Math.abs(offsetY) * 1.15) {
        session.current = null
        return
      }
      current.active = true
      setDirection(offsetX < 0 ? 1 : -1)
    }

    event.preventDefault()
    const elapsed = Math.max(1, event.timeStamp - current.lastTime)
    current.velocityX = ((event.clientX - current.lastX) / elapsed) * 1000
    current.lastX = event.clientX
    current.lastTime = event.timeStamp
    const width = Math.max(1, surface.current?.clientWidth ?? window.innerWidth)
    const progress = Math.min(1, Math.abs(offsetX) / width)
    rotation.set(offsetX < 0 ? -progress * 180 : progress * 180)
  }

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current
    if (!current || current.id !== event.pointerId) return
    const offsetX = event.clientX - current.startX
    const amount = getDateSwipeAmount(offsetX, current.velocityX)
    session.current = null
    if (amount) finishTurn(amount)
    else cancel()
  }

  return (
    <div
      className={cn('page-turn-surface relative', className)}
      onPointerCancel={cancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      ref={surface}
    >
      {direction && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" inert>
          {renderAdjacent(direction)}
        </div>
      )}
      <motion.div
        className="page-turn-sheet relative z-10"
        style={{
          rotateY: rotation,
          transformOrigin: direction === -1 ? 'right center' : 'left center',
        }}
      >
        <div className="[backface-visibility:hidden]">{children}</div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-paper paper-rules [backface-visibility:hidden] [transform:rotateY(180deg)]"
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-20 w-16 bg-gradient-to-r from-black/25 to-transparent"
          style={{
            left: direction === 1 ? 0 : 'auto',
            opacity: shadowOpacity,
            right: direction === -1 ? 0 : 'auto',
            scaleX: direction === -1 ? -1 : 1,
          }}
        />
      </motion.div>
    </div>
  )
})

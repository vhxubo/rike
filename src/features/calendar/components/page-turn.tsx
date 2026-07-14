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
import { getPageTurnVisual } from '@/features/calendar/page-turn-motion'
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
  const progress = useMotionValue(0)
  const foldY = useMotionValue(0.6)
  const directionRef = useRef<-1 | 1>(1)
  const currentX = useTransform(progress, (value) => `${getPageTurnVisual(value, directionRef.current).currentXPercent}%`)
  const currentRotateY = useTransform(progress, (value) => getPageTurnVisual(value, directionRef.current).currentRotateY)
  const targetX = useTransform(progress, (value) => `${getPageTurnVisual(value, directionRef.current).targetXPercent}%`)
  const targetOpacity = useTransform(progress, (value) => getPageTurnVisual(value, directionRef.current).targetOpacity)
  const edgeOpacity = useTransform(progress, (value) => getPageTurnVisual(value, directionRef.current).edgeIntensity * 0.32)
  const foldTop = useTransform([progress, foldY], ([turnProgress, pointerY]) =>
    `${getPageTurnVisual(Number(turnProgress), directionRef.current, Number(pointerY)).foldCenterPercent}%`,
  )
  const foldAngle = useTransform([progress, foldY], ([turnProgress, pointerY]) =>
    getPageTurnVisual(Number(turnProgress), directionRef.current, Number(pointerY)).foldAngle,
  )
  const [direction, setDirection] = useState<-1 | 1 | null>(null)
  const [busy, setBusy] = useState(false)
  const session = useRef<PointerSession | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const animationToken = useRef(0)

  const reset = () => {
    progress.set(0)
    setDirection(null)
    setBusy(false)
    session.current = null
  }

  const finishTurn = (amount: -1 | 1, preserveFold = false) => {
    if (busy) return
    if (!preserveFold) foldY.set(0.6)
    setBusy(true)
    directionRef.current = amount
    setDirection(amount)

    if (reduceMotion) {
      onTurn(amount)
      reset()
      return
    }

    const token = ++animationToken.current
    void animate(progress, 1, {
      type: 'spring',
      stiffness: 175,
      damping: 23,
      mass: 0.82,
    }).then(() => {
      if (token !== animationToken.current) return
      onTurn(amount)
      reset()
    })
  }

  const cancel = () => {
    const token = ++animationToken.current
    session.current = null
    if (reduceMotion || progress.get() === 0) {
      reset()
      return
    }
    setBusy(true)
    void animate(progress, 0, { type: 'spring', stiffness: 265, damping: 29 }).then(() => {
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
    const bounds = event.currentTarget.getBoundingClientRect()
    foldY.set(bounds.height ? (event.clientY - bounds.top) / bounds.height : 0.6)
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
      const nextDirection = offsetX < 0 ? 1 : -1
      directionRef.current = nextDirection
      setDirection(nextDirection)
    }

    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    foldY.set(bounds.height ? Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) : 0.6)
    const elapsed = Math.max(1, event.timeStamp - current.lastTime)
    current.velocityX = ((event.clientX - current.lastX) / elapsed) * 1000
    current.lastX = event.clientX
    current.lastTime = event.timeStamp
    const width = Math.max(1, surface.current?.clientWidth ?? window.innerWidth)
    progress.set(Math.min(1, Math.abs(offsetX) / width))
  }

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current
    if (!current || current.id !== event.pointerId) return
    const offsetX = event.clientX - current.startX
    const amount = getDateSwipeAmount(offsetX, current.velocityX)
    session.current = null
    if (amount) finishTurn(amount, true)
    else cancel()
  }

  return (
    <div
      className={cn('page-turn-surface relative overflow-visible', className)}
      onPointerCancel={cancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      ref={surface}
    >
      {direction && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          inert
          style={{ opacity: targetOpacity, x: targetX }}
        >
          {renderAdjacent(direction)}
        </motion.div>
      )}
      <motion.div
        className="page-turn-sheet relative z-10"
        style={{
          rotateY: currentRotateY,
          transformOrigin: direction === -1 ? 'right center' : 'left center',
          x: currentX,
        }}
      >
        <div>{children}</div>
        <motion.div
          aria-hidden="true"
          className={cn(
            'page-turn-fold pointer-events-none absolute z-20 h-44 w-24 -translate-y-1/2',
          )}
          style={{
            left: direction === -1 ? 0 : 'auto',
            opacity: edgeOpacity,
            right: direction === 1 ? 0 : 'auto',
            rotateZ: foldAngle,
            scaleX: direction === -1 ? -1 : 1,
            top: foldTop,
          }}
        />
        <motion.div
          aria-hidden="true"
          className="page-turn-edge pointer-events-none absolute z-30 h-44 w-px -translate-y-1/2"
          style={{
            left: direction === -1 ? 0 : 'auto',
            opacity: edgeOpacity,
            right: direction === 1 ? 0 : 'auto',
            rotateZ: foldAngle,
            top: foldTop,
          }}
        />
      </motion.div>
    </div>
  )
})

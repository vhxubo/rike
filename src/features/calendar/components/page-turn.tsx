import HTMLFlipBook from 'react-pageflip'
import { useReducedMotion } from 'motion/react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { canStartDateSwipe } from '@/features/plans/gestures'

export interface PageTurnHandle {
  turn: (amount: -1 | 1) => void
  cancel: () => void
}

interface PageTurnProps {
  canTurn?: (amount: -1 | 1) => boolean
  children: ReactNode
  className?: string
  currentKey: string
  onTurn: (amount: -1 | 1) => void
  renderAdjacent: (amount: -1 | 1) => ReactNode
}

interface PageFlipInstance {
  flipNext: () => void
  flipPrev: () => void
  turnToPage: (page: number) => void
}

interface SwipeSession {
  edge: 'left' | 'right'
  id: number
  horizontal: boolean
  startX: number
  startY: number
}

const BookPage = forwardRef<HTMLDivElement, { children: ReactNode; inactive?: boolean }>(
  function BookPage({ children, inactive = false }, ref) {
    return (
      <div
        aria-hidden={inactive || undefined}
        className="page-turn-page paper-rules h-full overflow-y-auto bg-paper"
        inert={inactive || undefined}
        ref={ref}
      >
        {children}
      </div>
    )
  },
)

export const PageTurn = forwardRef<PageTurnHandle, PageTurnProps>(function PageTurn(
  {
    canTurn = () => true,
    children,
    className,
    currentKey,
    onTurn,
    renderAdjacent,
  },
  ref,
) {
  const reduceMotion = useReducedMotion()
  const pageFlip = useRef<PageFlipInstance | null>(null)
  const pendingTurn = useRef<-1 | 1 | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const swipe = useRef<SwipeSession | null>(null)
  const [bookSize, setBookSize] = useState<{ height: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const element = surface.current
    if (!element) return
    const measure = () => {
      const next = { height: element.clientHeight, width: element.clientWidth }
      if (!next.height || !next.width) return
      setBookSize((current) =>
        current?.height === next.height && current.width === next.width ? current : next,
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.visualViewport?.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.visualViewport?.removeEventListener('resize', measure)
    }
  }, [])

  const reset = useCallback(() => {
    pendingTurn.current = null
    if (surface.current) delete surface.current.dataset.pageTurnDirection
    pageFlip.current?.turnToPage(1)
  }, [])

  const turn = useCallback((amount: -1 | 1) => {
    if (!canTurn(amount)) return
    if (reduceMotion) {
      onTurn(amount)
      return
    }
    pendingTurn.current = amount
    if (surface.current) {
      if (amount === -1) surface.current.dataset.pageTurnDirection = 'back'
      else delete surface.current.dataset.pageTurnDirection
    }
    if (pageFlip.current) {
      if (amount === 1) pageFlip.current.flipNext()
      else pageFlip.current.flipPrev()
      return
    }
    requestAnimationFrame(() => {
      if (amount === 1) pageFlip.current?.flipNext()
      else pageFlip.current?.flipPrev()
    })
  }, [canTurn, onTurn, reduceMotion])

  useEffect(() => {
    const frame = requestAnimationFrame(reset)
    return () => cancelAnimationFrame(frame)
  }, [currentKey, reset])

  useImperativeHandle(ref, () => ({ turn, cancel: reset }), [reset, turn])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) {
      swipe.current = null
      return
    }
    if (!canStartDateSwipe(event.target)) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const edgeWidth = Math.min(96, bounds.width * 0.22)
    const edge = event.clientX - bounds.left <= edgeWidth
      ? 'left'
      : bounds.right - event.clientX <= edgeWidth
        ? 'right'
        : null
    if (!edge) return
    swipe.current = {
      edge,
      id: event.pointerId,
      horizontal: false,
      startX: event.clientX,
      startY: event.clientY,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = swipe.current
    if (!current || current.id !== event.pointerId) return
    const offsetX = event.clientX - current.startX
    const offsetY = event.clientY - current.startY
    if (!current.horizontal) {
      if (Math.abs(offsetX) < 12 && Math.abs(offsetY) < 12) return
      if (Math.abs(offsetX) <= Math.abs(offsetY)) {
        swipe.current = null
        return
      }
      current.horizontal = true
    }
    event.preventDefault()
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = swipe.current
    swipe.current = null
    if (!current || current.id !== event.pointerId || !current.horizontal) return
    const offsetX = event.clientX - current.startX
    if (current.edge === 'left' && offsetX >= 48) turn(-1)
    if (current.edge === 'right' && offsetX <= -48) turn(1)
  }

  return (
    <div
      className={`page-turn-frame ${className ?? ''}`}
      onPointerCancel={() => { swipe.current = null }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={surface}
    >
      {bookSize && (
        <HTMLFlipBook
          autoSize={false}
          className="page-turn-surface"
          clickEventForward
          drawShadow
          flippingTime={reduceMotion ? 1 : 700}
          height={bookSize.height}
          key={`${bookSize.width}:${bookSize.height}`}
          maxHeight={960}
          maxShadowOpacity={0.38}
          maxWidth={1024}
          minHeight={bookSize.height}
          minWidth={bookSize.width}
          mobileScrollSupport
          onInit={(event) => {
            pageFlip.current = event.object as PageFlipInstance
            reset()
          }}
          onFlip={(event) => {
            const amount = pendingTurn.current
            pendingTurn.current = null
            if (amount) {
              if (canTurn(amount)) onTurn(amount)
              else reset()
              return
            }
            if (event.data === 0) {
              if (canTurn(-1)) onTurn(-1)
              else reset()
            }
            if (event.data === 2) {
              if (canTurn(1)) onTurn(1)
              else reset()
            }
          }}
          showCover={false}
          showPageCorners={false}
          size="fixed"
          startPage={1}
          startZIndex={0}
          style={{ maxWidth: '100%' }}
          swipeDistance={32}
          useMouseEvents={false}
          usePortrait
          width={bookSize.width}
        >
          <BookPage inactive>{renderAdjacent(-1)}</BookPage>
          <BookPage>{children}</BookPage>
          <BookPage inactive>{renderAdjacent(1)}</BookPage>
        </HTMLFlipBook>
      )}
    </div>
  )
})

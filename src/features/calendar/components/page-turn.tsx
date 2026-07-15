import HTMLFlipBook from 'react-pageflip'
import { useReducedMotion } from 'motion/react'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
  type TouchEvent,
} from 'react'

import { canStartDateSwipe, getDateSwipeAmount } from '@/features/plans/gestures'

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
  getSettings: () => { disableFlipByClick: boolean }
  turnToPage: (page: number) => void
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
  const touchStart = useRef<{ time: number; x: number; y: number } | null>(null)
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

  const flipProgrammatically = useCallback((amount: -1 | 1) => {
    const flip = pageFlip.current
    if (!flip) return

    const settings = flip.getSettings()
    const disableFlipByClick = settings.disableFlipByClick
    settings.disableFlipByClick = false
    if (amount === 1) flip.flipNext()
    else flip.flipPrev()
    settings.disableFlipByClick = disableFlipByClick
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
      flipProgrammatically(amount)
      return
    }
    requestAnimationFrame(() => {
      flipProgrammatically(amount)
    })
  }, [canTurn, flipProgrammatically, onTurn, reduceMotion])

  useImperativeHandle(ref, () => ({ turn, cancel: reset }), [reset, turn])

  const preserveControlInteraction = (event: SyntheticEvent) => {
    if (!canStartDateSwipe(event.target)) event.stopPropagation()
  }

  const handleTouchStart = (event: TouchEvent) => {
    if (!canStartDateSwipe(event.target)) {
      event.stopPropagation()
      return
    }
    const touch = event.touches[0]
    touchStart.current = { time: performance.now(), x: touch.clientX, y: touch.clientY }
    event.stopPropagation()
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (touchStart.current) event.stopPropagation()
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    event.stopPropagation()

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return

    const amount = getDateSwipeAmount(
      deltaX,
      deltaX / Math.max((performance.now() - start.time) / 1000, 0.001),
    )
    if (amount) turn(amount)
  }

  const handleTouchCancel = (event: TouchEvent) => {
    touchStart.current = null
    event.stopPropagation()
  }

  return (
    <div
      className={`page-turn-frame ${className ?? ''}`}
      onMouseDownCapture={preserveControlInteraction}
      onTouchCancelCapture={handleTouchCancel}
      onTouchEndCapture={handleTouchEnd}
      onTouchMoveCapture={handleTouchMove}
      onTouchStartCapture={handleTouchStart}
      ref={surface}
    >
      {bookSize && (
        <HTMLFlipBook
          autoSize={false}
          className="page-turn-surface"
          clickEventForward
          disableFlipByClick
          drawShadow
          flippingTime={reduceMotion ? 1 : 700}
          height={bookSize.height}
          key={`${currentKey}:${bookSize.width}:${bookSize.height}`}
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
          useMouseEvents
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

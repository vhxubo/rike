import { animate, useMotionValue, useReducedMotion } from 'motion/react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'

import { BookPageRenderer } from '@/features/calendar/book-page-renderer'
import { PageTextureCache } from '@/features/calendar/page-texture-cache'
import { canStartDateSwipe, getDateSwipeAmount } from '@/features/plans/gestures'
import { cn } from '@/lib/cn'

export interface PageTurnHandle {
  turn: (amount: -1 | 1) => void
  cancel: () => void
}

interface PageTurnProps {
  adjacentKeys: { previous: string; next: string }
  children: ReactNode
  className?: string
  currentKey: string
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

function pageElement(wrapper: HTMLDivElement | null) {
  return wrapper?.firstElementChild instanceof HTMLElement
    ? wrapper.firstElementChild
    : wrapper
}

export const PageTurn = forwardRef<PageTurnHandle, PageTurnProps>(function PageTurn(
  {
    adjacentKeys,
    children,
    className,
    currentKey,
    onTurn,
    renderAdjacent,
  },
  ref,
) {
  const reduceMotion = useReducedMotion()
  const textureCacheRef = useRef<PageTextureCache | null>(null)
  if (!textureCacheRef.current) textureCacheRef.current = new PageTextureCache()
  const textureCache = textureCacheRef.current
  const progress = useMotionValue(0)
  const pointerY = useMotionValue(0.6)
  const foldCornerY = useRef<0 | 1>(1)
  const directionRef = useRef<-1 | 1>(1)
  const [direction, setDirection] = useState<-1 | 1 | null>(null)
  const [busy, setBusy] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const canvasReadyRef = useRef(false)
  const fallbackRef = useRef(false)
  const session = useRef<PointerSession | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const currentPage = useRef<HTMLDivElement>(null)
  const targetPage = useRef<HTMLDivElement>(null)
  const previousPrefetch = useRef<HTMLDivElement>(null)
  const nextPrefetch = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const renderer = useRef<BookPageRenderer | null>(null)
  const preparation = useRef<Promise<void> | null>(null)
  const preparationGeneration = useRef(0)
  const animationToken = useRef(0)

  const textureKey = (key: string, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect()
    const theme = document.documentElement.dataset.theme ?? 'light'
    return `${key}:${theme}:${Math.round(bounds.width)}x${Math.round(bounds.height)}:${window.devicePixelRatio || 1}`
  }

  const activateFallback = () => {
    const activeRenderer = renderer.current
    renderer.current = null
    activeRenderer?.dispose()
    if (canvas.current) canvas.current.style.display = 'none'
    if (currentPage.current) {
      currentPage.current.style.opacity = '1'
      currentPage.current.style.transform = ''
    }
    if (targetPage.current) {
      targetPage.current.style.opacity = ''
      targetPage.current.style.transform = ''
      targetPage.current.style.zIndex = ''
    }
    canvasReadyRef.current = false
    fallbackRef.current = true
    setCanvasReady(false)
  }

  const draw = () => {
    const value = progress.get()
    const turnDirection = directionRef.current
    if (renderer.current && canvasReadyRef.current) {
      try {
        renderer.current.render(
          value,
          turnDirection === -1,
          pointerY.get(),
          foldCornerY.current,
        )
      } catch {
        activateFallback()
        draw()
      }
      return
    }
    if (!fallbackRef.current) return

    const current = currentPage.current
    const target = targetPage.current
    if (turnDirection === 1 && current) {
      current.style.transform = `translate3d(${-value * 100}%, 0, 0)`
    }
    if (turnDirection === -1 && target) {
      target.style.opacity = '1'
      target.style.transform = `translate3d(${(value - 1) * 100}%, 0, 0)`
      target.style.zIndex = '30'
    }
  }

  useEffect(() => {
    const unsubscribeProgress = progress.on('change', draw)
    const unsubscribePointer = pointerY.on('change', draw)
    return () => {
      unsubscribeProgress()
      unsubscribePointer()
    }
  }, [pointerY, progress])

  useEffect(() => {
    if (reduceMotion) return
    const candidates = [
      { baseKey: currentKey, element: pageElement(currentPage.current) },
      { baseKey: adjacentKeys.previous, element: pageElement(previousPrefetch.current) },
      { baseKey: adjacentKeys.next, element: pageElement(nextPrefetch.current) },
    ].filter(
      (candidate): candidate is { baseKey: string; element: HTMLElement } =>
        Boolean(candidate.element),
    )
    if (!candidates.length) return
    const capture = () => {
      const keys = candidates.map(({ baseKey, element }) => textureKey(baseKey, element))
      textureCache.retain(keys)
      for (const [index, candidate] of candidates.entries()) {
        void textureCache.capture(keys[index], candidate.element).catch(() => undefined)
      }
    }
    let idleHandle: number | null = null
    const delayHandle = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(capture)
        return
      }
      capture()
    }, 180)
    return () => {
      window.clearTimeout(delayHandle)
      if (idleHandle !== null) window.cancelIdleCallback(idleHandle)
    }
  }, [adjacentKeys.next, adjacentKeys.previous, currentKey, reduceMotion])

  useEffect(() => () => {
    preparationGeneration.current += 1
    animationToken.current += 1
    renderer.current?.dispose()
    renderer.current = null
    textureCache.clear()
  }, [])

  const resetVisuals = () => {
    renderer.current?.dispose()
    renderer.current = null
    if (canvas.current) {
      const gl = canvas.current.getContext('webgl')
      gl?.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      canvas.current.style.display = 'none'
    }
    if (currentPage.current) {
      currentPage.current.style.opacity = '1'
      currentPage.current.style.transform = ''
    }
    if (targetPage.current) {
      targetPage.current.style.opacity = ''
      targetPage.current.style.transform = ''
      targetPage.current.style.zIndex = ''
    }
    setCanvasReady(false)
    canvasReadyRef.current = false
    fallbackRef.current = false
  }

  const reset = () => {
    preparationGeneration.current += 1
    progress.set(0)
    pointerY.set(0.6)
    foldCornerY.current = 1
    resetVisuals()
    setDirection(null)
    setBusy(false)
    session.current = null
    preparation.current = null
  }

  const prepareRenderer = (amount: -1 | 1) => {
    if (reduceMotion) return Promise.resolve()
    if (preparation.current) return preparation.current

    const generation = ++preparationGeneration.current
    preparation.current = new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        const sourceWrapper = amount === 1 ? currentPage.current : targetPage.current
        const source = pageElement(sourceWrapper)
        const canvasElement = canvas.current
        const bounds = pageElement(currentPage.current)?.getBoundingClientRect()
        if (!source || !canvasElement || !bounds) {
          fallbackRef.current = true
          resolve()
          return
        }

        const baseKey = amount === 1 ? currentKey : adjacentKeys.previous
        const key = textureKey(baseKey, source)
        void textureCache.capture(key, source).then((captured) => {
          if (generation !== preparationGeneration.current) {
            resolve()
            return
          }
          try {
            const previousRenderer = renderer.current
            renderer.current = null
            previousRenderer?.dispose()
            const nextRenderer = new BookPageRenderer(canvasElement, {
              onContextLost: () => {
                if (renderer.current !== nextRenderer) return
                activateFallback()
                draw()
              },
            })
            nextRenderer.resize(bounds.width, bounds.height)
            nextRenderer.setTexture(captured)
            renderer.current = nextRenderer
            nextRenderer.render(
              progress.get(),
              amount === -1,
              pointerY.get(),
              foldCornerY.current,
            )
            canvasReadyRef.current = true
            canvasElement.style.display = 'block'
            setCanvasReady(true)
            if (amount === 1 && currentPage.current) currentPage.current.style.opacity = '0'
          } catch {
            activateFallback()
            draw()
          }
          resolve()
        }).catch(() => {
          activateFallback()
          draw()
          resolve()
        })
      })
    })
    return preparation.current
  }

  const finishTurn = (amount: -1 | 1, preservePointer = false) => {
    if (busy) return
    if (!preservePointer) {
      pointerY.set(0.6)
      foldCornerY.current = 1
    }
    setBusy(true)
    directionRef.current = amount
    setDirection(amount)

    if (reduceMotion) {
      onTurn(amount)
      reset()
      return
    }

    const token = ++animationToken.current
    void prepareRenderer(amount).then(() => {
      if (token !== animationToken.current) return
      void animate(progress, 1, {
        type: 'spring',
        stiffness: 150,
        damping: 22,
        mass: 0.9,
      }).then(() => {
        if (token !== animationToken.current) return
        onTurn(amount)
        reset()
      })
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
    void animate(progress, 0, { type: 'spring', stiffness: 235, damping: 28 }).then(() => {
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

    event.currentTarget.setPointerCapture?.(event.pointerId)
    const bounds = event.currentTarget.getBoundingClientRect()
    const initialPointerY = bounds.height
      ? Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
      : 0.6
    pointerY.set(initialPointerY)
    foldCornerY.current = initialPointerY < 0.5 ? 0 : 1
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
      void prepareRenderer(nextDirection)
    }

    event.preventDefault()
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerY.set(bounds.height ? Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) : 0.6)
    const elapsed = Math.max(1, event.timeStamp - current.lastTime)
    current.velocityX = ((event.clientX - current.lastX) / elapsed) * 1000
    current.lastX = event.clientX
    current.lastTime = event.timeStamp
    progress.set(Math.min(1, Math.abs(offsetX) / Math.max(1, bounds.width)))
  }

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current
    if (!current || current.id !== event.pointerId) return
    const amount = getDateSwipeAmount(event.clientX - current.startX, current.velocityX)
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
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          inert
          ref={targetPage}
        >
          {renderAdjacent(direction)}
        </div>
      )}
      <div className="relative z-10" ref={currentPage}>{children}</div>
      <canvas
        aria-hidden="true"
        className="pointer-events-none absolute top-0 z-20"
        ref={canvas}
        style={{ display: canvasReady ? 'block' : 'none' }}
      />
      {!direction && (
        <div aria-hidden="true" className="pointer-events-none absolute left-[-220vw] top-0 w-full" inert>
          <div ref={previousPrefetch}>{renderAdjacent(-1)}</div>
          <div ref={nextPrefetch}>{renderAdjacent(1)}</div>
        </div>
      )}
    </div>
  )
})

import { useEffect } from 'react'

export function isBrowserZoomShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && ['+', '-', '=', '0'].includes(event.key)
}

export function installNativeBehaviorGuards(target: Document = document) {
  const prevent = (event: Event) => event.preventDefault()
  const preventMultiTouch = (event: TouchEvent) => {
    if (event.touches.length > 1) event.preventDefault()
  }
  const preventZoomWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault()
  }
  const preventZoomKey = (event: KeyboardEvent) => {
    if (isBrowserZoomShortcut(event)) event.preventDefault()
  }

  target.addEventListener('gesturestart', prevent, { passive: false })
  target.addEventListener('gesturechange', prevent, { passive: false })
  target.addEventListener('gestureend', prevent, { passive: false })
  target.addEventListener('touchmove', preventMultiTouch, { passive: false })
  target.addEventListener('wheel', preventZoomWheel, { passive: false })
  target.addEventListener('keydown', preventZoomKey)
  target.addEventListener('dragstart', prevent)

  return () => {
    target.removeEventListener('gesturestart', prevent)
    target.removeEventListener('gesturechange', prevent)
    target.removeEventListener('gestureend', prevent)
    target.removeEventListener('touchmove', preventMultiTouch)
    target.removeEventListener('wheel', preventZoomWheel)
    target.removeEventListener('keydown', preventZoomKey)
    target.removeEventListener('dragstart', prevent)
  }
}

export function useNativeBehaviorGuards() {
  useEffect(() => installNativeBehaviorGuards(), [])
}

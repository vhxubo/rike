import {
  installNativeBehaviorGuards,
  isBrowserZoomShortcut,
} from '@/app/native-behavior'

describe('native browser behavior guards', () => {
  it('recognizes browser zoom shortcuts', () => {
    expect(isBrowserZoomShortcut(new KeyboardEvent('keydown', { ctrlKey: true, key: '+' }))).toBe(true)
    expect(isBrowserZoomShortcut(new KeyboardEvent('keydown', { metaKey: true, key: '0' }))).toBe(true)
    expect(isBrowserZoomShortcut(new KeyboardEvent('keydown', { ctrlKey: true, key: 'c' }))).toBe(false)
  })

  it('prevents zoom wheel, shortcuts, gestures, and native drag', () => {
    const cleanup = installNativeBehaviorGuards(document)
    const events = [
      new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true }),
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ctrlKey: true, key: '-' }),
      new Event('gesturestart', { bubbles: true, cancelable: true }),
      new Event('dragstart', { bubbles: true, cancelable: true }),
    ]

    for (const event of events) {
      document.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    }

    cleanup()
  })
})

import html2canvas from 'html2canvas'

const MAX_TEXTURE_EDGE = 4096

export class PageTextureCache {
  private readonly entries = new Map<string, Promise<HTMLCanvasElement>>()

  capture(key: string, element: HTMLElement) {
    const existing = this.entries.get(key)
    if (existing) return existing

    const bounds = element.getBoundingClientRect()
    const scale = Math.min(
      window.devicePixelRatio || 1,
      2,
      MAX_TEXTURE_EDGE / Math.max(1, bounds.width),
      MAX_TEXTURE_EDGE / Math.max(1, bounds.height),
    )
    const task = html2canvas(element, {
      backgroundColor: null,
      logging: false,
      scale,
      useCORS: false,
      width: Math.max(1, Math.round(bounds.width)),
      height: Math.max(1, Math.round(bounds.height)),
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
    }).catch((error: unknown) => {
      this.entries.delete(key)
      throw error
    })

    this.entries.set(key, task)
    return task
  }

  retain(keys: string[]) {
    const retained = new Set(keys)
    for (const key of this.entries.keys()) {
      if (!retained.has(key)) this.entries.delete(key)
    }
  }

  clear() {
    this.entries.clear()
  }
}

declare module '@lucky-canvas/react' {
  import { Component, type Ref } from 'react'

  interface LuckyFont {
    fontColor?: string
    fontSize?: string
    fontWeight?: string
    lineClamp?: number
    text: string
    top?: string | number
  }

  interface LuckyPrize {
    background?: string
    fonts?: LuckyFont[]
    range?: number
  }

  interface LuckyWheelProps {
    blocks?: Array<{ background?: string; padding?: string }>
    buttons?: Array<{
      background?: string
      fonts?: LuckyFont[]
      pointer?: boolean
      radius?: string
    }>
    defaultConfig?: Record<string, unknown>
    defaultStyle?: Record<string, unknown>
    height: number | string
    onEnd?: (prize: LuckyPrize) => void
    onStart?: () => void
    prizes: LuckyPrize[]
    ref?: Ref<LuckyWheel>
    width: number | string
  }

  export class LuckyWheel extends Component<LuckyWheelProps> {
    play(): void
    stop(index?: number): void
  }
}

import type { ReactNode } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'size'> {
  label: string
  children: ReactNode
}

export function IconButton({ label, ...props }: IconButtonProps) {
  return (
    <Button aria-label={label} size="icon" title={label} {...props} />
  )
}


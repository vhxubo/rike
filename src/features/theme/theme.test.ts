import { applyTheme, readThemePreference } from '@/features/theme'
import { resolveTheme } from '@/features/theme/model'

describe('theme preference', () => {
  it('resolves system and explicit themes', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('falls back to system for missing and invalid storage', () => {
    expect(readThemePreference({ getItem: () => null })).toBe('system')
    expect(readThemePreference({ getItem: () => 'sepia' })).toBe('system')
  })

  it('applies resolved theme attributes', () => {
    const root = document.createElement('html')
    expect(applyTheme('system', true, root)).toBe('dark')
    expect(root.dataset).toMatchObject({ theme: 'dark', themePreference: 'system' })
  })
})

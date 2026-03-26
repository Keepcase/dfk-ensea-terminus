import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <Sun
        className={`w-3.5 h-3.5 transition-colors ${!isDark ? 'text-foreground' : 'text-muted-foreground/40'}`}
      />
      <button
        role="switch"
        type="button"
        aria-checked={isDark}
        onClick={toggleTheme}
        className="theme-switch"
        data-checked={isDark ? '' : undefined}
      >
        <span className="theme-switch-thumb" />
      </button>
      <Moon
        className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-foreground' : 'text-muted-foreground/40'}`}
      />
    </label>
  )
}

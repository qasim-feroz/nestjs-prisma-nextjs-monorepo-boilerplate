'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ThemeName, themes, defaultTheme } from '@/lib/themes'

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  availableThemes: typeof themes
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const stored = localStorage.getItem('theme') as ThemeName | null
    if (stored && themes[stored]) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Apply theme to CSS variables
    const currentTheme = themes[theme]
    const isDark = document.documentElement.classList.contains('dark')
    const colors = isDark ? currentTheme.dark : currentTheme.light

    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
  }

  // Always provide context, even during SSR (using default theme)
  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


'use client'

import { useTheme } from '@/contexts/theme-context'
import { ThemeName } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Palette } from 'lucide-react'
import { useState } from 'react'

export function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme()
  const [open, setOpen] = useState(false)

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        title="Change theme"
      >
        <Palette className="h-4 w-4" />
        <span className="sr-only">Change theme</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
            <DialogDescription>
              Select a theme that fits your preference
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {Object.values(availableThemes).map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => handleThemeChange(themeOption.name)}
                className={`relative flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all hover:bg-accent ${
                  theme === themeOption.name
                    ? 'border-primary bg-accent'
                    : 'border-border'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
                {theme === themeOption.name && (
                  <div className="ml-4 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


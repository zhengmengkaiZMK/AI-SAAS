"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

import { useMetaColor } from "@/hooks/use-meta-color"
import { cn } from "@/lib/utils"

// 这些路径会强制使用暗夜模式，无法切换
const DARK_THEME_PATHS: string[] = []

export function ModeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { setMetaColor, metaColor } = useMetaColor()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  const isForced = DARK_THEME_PATHS.includes(pathname)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setMetaColor(metaColor)
  }, [metaColor, setMetaColor])

  const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
    if (isForced) return
    setTheme(newTheme)
  }

  // 避免 hydration 不匹配
  if (!mounted) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-800 flex h-9 items-center rounded-lg p-0.5 lg:h-7">
        <div className="h-8 w-8 lg:h-6 lg:w-6" />
        <div className="h-8 w-8 lg:h-6 lg:w-6" />
        <div className="h-8 w-8 lg:h-6 lg:w-6" />
      </div>
    )
  }

  const buttonClass = (isActive: boolean) =>
    cn(
      "flex h-8 w-8 lg:h-6 lg:w-6 items-center justify-center rounded-md transition-all duration-200",
      "hover:bg-white/80 dark:hover:bg-neutral-800",
      isActive && "bg-white dark:bg-neutral-800 text-foreground shadow-sm",
      !isActive && "text-muted-foreground",
      isForced && "cursor-not-allowed opacity-50"
    )

  return (
    <div 
      className="bg-neutral-100 dark:bg-neutral-800 flex items-center gap-0.5 rounded-lg p-0.5"
      title={isForced ? "Theme locked on this page" : "Change theme"}
    >
      <button
        onClick={() => handleThemeChange("system")}
        disabled={isForced}
        className={buttonClass(theme === "system")}
        aria-label="System theme"
      >
        <span className="text-sm font-medium lg:text-xs">A</span>
      </button>
      
      <button
        onClick={() => handleThemeChange("light")}
        disabled={isForced}
        className={buttonClass(theme === "light")}
        aria-label="Light theme"
      >
        <Sun className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
      </button>
      
      <button
        onClick={() => handleThemeChange("dark")}
        disabled={isForced}
        className={buttonClass(theme === "dark")}
        aria-label="Dark theme"
      >
        <Moon className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
      </button>
    </div>
  )
}

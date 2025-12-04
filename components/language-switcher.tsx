"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { localeConfig, type Locale } from "@/lib/i18n"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale: Locale = pathname.startsWith("/zh") ? "zh" : "en"
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const switchLanguage = (locale: Locale) => {
    if (locale === currentLocale) return

    // 设置语言偏好 cookie
    document.cookie = `language=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`

    let newPath = pathname
    if (locale === "zh") {
      newPath = pathname.startsWith("/zh") ? pathname : `/zh${pathname}`
    } else {
      newPath = pathname.replace(/^\/zh/, "") || "/"
    }

    router.push(newPath)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 focus-visible:ring-0 data-[state=open]:bg-transparent">
        <Globe className="h-3.5 w-3.5" />
        <span className="text-xs">{localeConfig[currentLocale].label}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 focus-visible:ring-0 data-[state=open]:bg-transparent">
          <Globe className="h-3.5 w-3.5" />
          <span className="text-xs">{localeConfig[currentLocale].label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {(
          Object.entries(localeConfig) as [
            Locale,
            (typeof localeConfig)[Locale],
          ][]
        ).map(([code, config]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLanguage(code)}
            className={currentLocale === code ? "font-medium" : ""}
          >
            {config.name}
            {currentLocale === code && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { StarButton } from "@/components/ui/star-button"

export function ActionButton() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [lightColor, setLightColor] = useState("#FAFAFA")

  useEffect(() => {
    setLightColor(theme === "dark" ? "#FAFAFA" : "#3B82F6")
  }, [theme])

  const isZh = pathname.startsWith("/zh")

  const handleClick = () => {
    window.open("/login", "_self")
  }

  return (
    <StarButton 
      lightColor={lightColor} 
      className="rounded-3xl h-8 text-[13.5px] px-3 cursor-pointer"
      duration={6}
      onClick={handleClick}
    >
      {isZh ? "登录" : "Login"}
    </StarButton>
  )
}

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Client-side Theme Context Provider.
 * Wraps the application to provide theme context (light/dark/system) via `next-themes`.
 * Handles hydration mismatch avoidance and persists local storage preference.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { FlowgladProvider } from "@flowglad/nextjs"

export function Providers({ 
  children, 
  loadBilling 
}: { 
  children: React.ReactNode
  loadBilling: boolean 
}) {
  return (
    <FlowgladProvider loadBilling={loadBilling} serverRoute="/api/flowglad">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </FlowgladProvider>
  )
}
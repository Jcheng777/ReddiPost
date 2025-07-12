import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthHeader } from "@/components/auth-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="px-6 py-3 flex justify-end">
          <AuthHeader />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

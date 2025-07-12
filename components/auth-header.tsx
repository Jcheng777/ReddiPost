"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function AuthHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}
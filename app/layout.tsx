import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { getSession } from "@/lib/auth"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ReddiPost - Reddit Post Generator",
  description: "Find relevant subreddits and generate posts that match community guidelines",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const isAuthenticated = !!session

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers loadBilling={isAuthenticated}>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}

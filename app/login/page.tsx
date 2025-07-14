"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/dashboard')
        }
      })

    // Check for error in URL params
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'access_denied':
          setError('Access was denied. Please try again.')
          break
        case 'invalid_request':
          setError('Invalid request. Please try again.')
          break
        case 'invalid_state':
          setError('Security check failed. Please try again.')
          break
        case 'token_exchange_failed':
          setError('Failed to authenticate with Reddit. Please try again.')
          break
        default:
          setError('An error occurred. Please try again.')
      }
    }
  }, [router, searchParams])

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login')
      const data = await response.json()
      
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError('Failed to generate login URL')
      }
    } catch (err) {
      setError('Failed to initiate login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-blue-950">
      {/* Navigation */}
      <nav className="p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-white font-semibold text-lg">ReddiPost</span>
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex items-center justify-center px-4 pb-20" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center">
            <span className="text-white font-bold text-3xl">R</span>
          </div>

          {/* Title and subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Welcome to ReddiPost</h1>
            <p className="text-gray-300">Connect your Reddit account to get started</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
            size="lg"
          >
            {loading ? (
              "Redirecting to Reddit..."
            ) : (
              <>
                Continue with Reddit
                <ExternalLink className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Permissions */}
          <div className="space-y-3 text-left">
            <p className="text-gray-300 text-sm font-medium">We'll request these permissions:</p>
            <ul className="space-y-2 text-gray-400 text-sm ml-4">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>View your Reddit username</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Read your posts and comments</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Submit posts on your behalf</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-4 space-y-2">
            <p className="text-xs text-gray-400 text-center">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-gray-300 hover:text-white underline">
                Terms
              </Link>
              {" and "}
              <Link href="/privacy" className="text-gray-300 hover:text-white underline">
                Privacy Policy
              </Link>
            </p>
            <p className="text-xs text-gray-500 text-center">
              Your Reddit credentials are never stored by ReddiPost.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
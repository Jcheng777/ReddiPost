"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertCircle } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to ReddiPost</CardTitle>
          <CardDescription>
            Connect your Reddit account to start creating engaging posts with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>ReddiPost will request the following permissions:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>View your Reddit username</li>
                <li>Read your posts and comments</li>
                <li>Submit posts on your behalf</li>
                <li>Edit your posts</li>
              </ul>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Redirecting to Reddit..."
              ) : (
                <>
                  Continue with Reddit
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to ReddiPost's terms of service and privacy policy.
              Your Reddit credentials are never stored by ReddiPost.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
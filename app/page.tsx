"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-white font-bold text-xl">ReddiCraft</span>
            </Link>

            {/* Center Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-300 hover:text-white transition-colors text-sm">
                About
              </Link>
              <Link href="#contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                onClick={handleSignIn}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">AI-Powered Reddit Marketing</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Find and Market Your<br />
              Ideas on Reddit
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover the perfect subreddits for your product and generate
              engaging posts that follow community guidelines. Turn Reddit into
              your most powerful marketing channel.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
                onClick={handleSignIn}
              >
                Get Started Free
                <span className="ml-2">→</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient Orb Effects */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl"></div>
      </section>

      {/* Features Section Preview */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">AI-Powered Discovery</h3>
              <p className="text-gray-400">
                Find the most relevant subreddits for your product using advanced AI analysis
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Smart Post Generation</h3>
              <p className="text-gray-400">
                Create engaging posts that match each subreddit's tone and guidelines
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Performance Tracking</h3>
              <p className="text-gray-400">
                Monitor your posts' performance and optimize your Reddit marketing strategy
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
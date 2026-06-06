'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await auth.getSession()
        if (!session) {
          router.push('/sign-in')
          return
        }
        setUser(session.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">HR System</h1>
          <p className="text-gray-400 text-sm mt-1">Management Platform</p>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-2 px-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              📊 Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/employees">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              👥 Employees
            </Button>
          </Link>
          <Link href="/dashboard/attendance">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              ✓ Attendance
            </Button>
          </Link>
          <Link href="/dashboard/leaves">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              📋 Leaves
            </Button>
          </Link>
          <Link href="/dashboard/payroll">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              💰 Payroll
            </Button>
          </Link>
          <Link href="/dashboard/performance">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              ⭐ Performance
            </Button>
          </Link>
          <Link href="/dashboard/recruiting">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              🤖 AI Resume Screening
            </Button>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {user?.name || 'User'}
            </h2>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

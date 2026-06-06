'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  employees,
  attendance,
  leaves,
  analyticsSnapshots,
} from '@/lib/db/schema'
import { and, desc, eq, gte } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDashboardMetrics() {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]
  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  const thisMonthStartStr = thisMonthStart.toISOString().split('T')[0]

  // Total employees
  const totalEmployees = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))

  // Present today
  const presentToday = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.userId, userId),
        eq(attendance.date, today),
        eq(attendance.status, 'present')
      )
    )

  // Pending leave requests
  const pendingLeaves = await db
    .select()
    .from(leaves)
    .where(
      and(eq(leaves.userId, userId), eq(leaves.status, 'pending'))
    )

  // Attendance this month
  const attendanceThisMonth = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.userId, userId),
        gte(attendance.date, thisMonthStartStr)
      )
    )

  const presentThisMonth = attendanceThisMonth.filter(
    (a) => a.status === 'present'
  ).length
  const attendancePercentage =
    attendanceThisMonth.length > 0
      ? Math.round((presentThisMonth / attendanceThisMonth.length) * 100)
      : 0

  return {
    totalEmployees: totalEmployees.length,
    presentToday: presentToday.length,
    pendingLeaveRequests: pendingLeaves.length,
    monthlyAttendanceRate: attendancePercentage,
  }
}

export async function getEmployeeGrowthData() {
  const userId = await getUserId()

  // Get employees grouped by month
  const employeeData = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .orderBy(employees.dateOfJoining)

  // Group by month
  const monthlyData: Record<
    string,
    number
  > = {}
  let cumulativeCount = 0

  employeeData.forEach((emp) => {
    const monthKey = new Date(emp.dateOfJoining)
      .toISOString()
      .substring(0, 7)
    cumulativeCount++
    monthlyData[monthKey] = cumulativeCount
  })

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    employees: count,
  }))
}

export async function getDepartmentDistribution() {
  const userId = await getUserId()

  const empsByDept = await db
    .select({
      departmentId: employees.departmentId,
      count: employees.id,
    })
    .from(employees)
    .where(eq(employees.userId, userId))

  const distribution: Record<string, number> = {}
  empsByDept.forEach((item) => {
    const dept = item.departmentId || 'Unassigned'
    distribution[dept] = (distribution[dept] || 0) + 1
  })

  return Object.entries(distribution).map(([dept, count]) => ({
    name: String(dept),
    value: count,
  }))
}

export async function getAttendanceTrend(days: number = 30) {
  const userId = await getUserId()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const records = await db
    .select()
    .from(attendance)
    .where(
      and(eq(attendance.userId, userId), gte(attendance.date, startDateStr))
    )
    .orderBy(attendance.date)

  // Group by date and calculate metrics
  const dailyData: Record<
    string,
    { present: number; absent: number; total: number }
  > = {}

  records.forEach((record) => {
    const dateStr = record.date
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { present: 0, absent: 0, total: 0 }
    }
    dailyData[dateStr].total++
    if (record.status === 'present') {
      dailyData[dateStr].present++
    } else {
      dailyData[dateStr].absent++
    }
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    present: data.present,
    absent: data.absent,
    percentage: Math.round((data.present / data.total) * 100),
  }))
}

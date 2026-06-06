'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { attendance } from '@/lib/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function checkIn(employeeId: number) {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]

  // Check if already checked in today
  const existingRecord = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.userId, userId),
        eq(attendance.employeeId, employeeId),
        eq(attendance.date, today)
      )
    )

  if (existingRecord.length > 0) {
    throw new Error('Already checked in today')
  }

  const result = await db
    .insert(attendance)
    .values({
      userId,
      employeeId,
      checkInTime: new Date(),
      date: today,
      status: 'present',
    })
    .returning()

  revalidatePath('/dashboard/attendance')
  return result[0]
}

export async function checkOut(employeeId: number) {
  const userId = await getUserId()
  const today = new Date().toISOString().split('T')[0]

  const record = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.userId, userId),
        eq(attendance.employeeId, employeeId),
        eq(attendance.date, today)
      )
    )

  if (record.length === 0) {
    throw new Error('No check-in record found for today')
  }

  const result = await db
    .update(attendance)
    .set({ checkOutTime: new Date() })
    .where(eq(attendance.id, record[0].id))
    .returning()

  revalidatePath('/dashboard/attendance')
  return result[0]
}

export async function getAttendanceRecords(
  employeeId?: number,
  startDate?: string,
  endDate?: string
) {
  const userId = await getUserId()
  let query = db
    .select()
    .from(attendance)
    .where(eq(attendance.userId, userId))

  if (employeeId) {
    query = query.where(eq(attendance.employeeId, employeeId))
  }

  if (startDate) {
    query = query.where(gte(attendance.date, startDate))
  }

  if (endDate) {
    query = query.where(lte(attendance.date, endDate))
  }

  return query.orderBy(desc(attendance.date))
}

export async function getAttendanceReport(month: number, year: number) {
  const userId = await getUserId()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const records = await db
    .select()
    .from(attendance)
    .where(
      and(
        eq(attendance.userId, userId),
        gte(attendance.date, startDate),
        lte(attendance.date, endDate)
      )
    )
    .orderBy(desc(attendance.date))

  // Calculate statistics
  const stats = {
    totalDays: records.length,
    presentDays: records.filter((r) => r.status === 'present').length,
    absentDays: records.filter((r) => r.status === 'absent').length,
    attendancePercentage:
      records.length > 0
        ? Math.round(
            (records.filter((r) => r.status === 'present').length /
              records.length) *
              100
          )
        : 0,
  }

  return { records, stats }
}

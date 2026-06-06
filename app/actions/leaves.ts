'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { leaves } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function applyLeave(data: {
  employeeId: number
  leaveType: string
  startDate: string
  endDate: string
  reason?: string
}) {
  const userId = await getUserId()
  const result = await db
    .insert(leaves)
    .values({
      userId,
      employeeId: data.employeeId,
      leaveType: data.leaveType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
      status: 'pending',
    })
    .returning()

  revalidatePath('/dashboard/leaves')
  return result[0]
}

export async function getLeaveRequests(employeeId?: number) {
  const userId = await getUserId()
  const query = db
    .select()
    .from(leaves)
    .where(eq(leaves.userId, userId))

  if (employeeId) {
    query.where(eq(leaves.employeeId, employeeId))
  }

  return query.orderBy(desc(leaves.createdAt))
}

export async function updateLeaveStatus(
  id: number,
  status: 'approved' | 'rejected' | 'pending'
) {
  const userId = await getUserId()
  const result = await db
    .update(leaves)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leaves.id, id), eq(leaves.userId, userId)))
    .returning()

  revalidatePath('/dashboard/leaves')
  return result[0]
}

export async function getLeaveBalance(employeeId: number) {
  const userId = await getUserId()
  const allLeaves = await db
    .select()
    .from(leaves)
    .where(
      and(eq(leaves.userId, userId), eq(leaves.employeeId, employeeId))
    )
  )

  const approvedLeaves = allLeaves.filter((l) => l.status === 'approved')

  // Calculate total days taken
  let totalDaysTaken = 0
  approvedLeaves.forEach((leave) => {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    totalDaysTaken += days
  })

  const totalLeaveEntitlement = 20 // Annual leave entitlement
  const remainingBalance = totalLeaveEntitlement - totalDaysTaken

  return {
    totalEntitlement: totalLeaveEntitlement,
    daysTaken: totalDaysTaken,
    remainingBalance,
    approvedLeaves,
    pendingLeaves: allLeaves.filter((l) => l.status === 'pending'),
  }
}

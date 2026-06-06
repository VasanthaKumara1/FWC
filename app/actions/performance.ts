'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { performanceReviews, employees } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getPerformanceReviews() {
  const userId = await getUserId()
  return db
    .select({
      id: performanceReviews.id,
      employeeId: performanceReviews.employeeId,
      employeeName: employees.name,
      position: employees.position,
      rating: performanceReviews.rating,
      comments: performanceReviews.comments,
      reviewDate: performanceReviews.reviewDate,
      reviewerId: performanceReviews.reviewerId,
      createdAt: performanceReviews.createdAt,
    })
    .from(performanceReviews)
    .leftJoin(employees, eq(performanceReviews.employeeId, employees.id))
    .where(eq(performanceReviews.userId, userId))
    .orderBy(desc(performanceReviews.reviewDate))
}

export async function getPerformanceReviewsByEmployee(employeeId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(performanceReviews)
    .where(
      and(
        eq(performanceReviews.userId, userId),
        eq(performanceReviews.employeeId, employeeId)
      )
    )
    .orderBy(desc(performanceReviews.reviewDate))
}

export async function getPerformanceStats(year?: number) {
  const userId = await getUserId()
  const currentYear = year || new Date().getFullYear()

  const stats = await db
    .select({
      avgRating: sql<number>`AVG(CAST(${performanceReviews.rating} as NUMERIC))`,
      totalReviews: sql<number>`COUNT(*)`,
      excellentCount: sql<number>`COUNT(CASE WHEN CAST(${performanceReviews.rating} as NUMERIC) >= 4.5 THEN 1 END)`,
      goodCount: sql<number>`COUNT(CASE WHEN CAST(${performanceReviews.rating} as NUMERIC) >= 3.5 AND CAST(${performanceReviews.rating} as NUMERIC) < 4.5 THEN 1 END)`,
      averageCount: sql<number>`COUNT(CASE WHEN CAST(${performanceReviews.rating} as NUMERIC) < 3.5 THEN 1 END)`,
    })
    .from(performanceReviews)
    .where(eq(performanceReviews.userId, userId))

  return stats[0]
}

export async function getPerformanceByRating() {
  const userId = await getUserId()

  const data = await db
    .select({
      rating: performanceReviews.rating,
      count: sql<number>`COUNT(*)`,
    })
    .from(performanceReviews)
    .where(eq(performanceReviews.userId, userId))
    .groupBy(performanceReviews.rating)
    .orderBy(performanceReviews.rating)

  return data
}

export async function createPerformanceReview(data: {
  employeeId: number
  rating: number
  comments: string
  reviewDate: string
}) {
  const userId = await getUserId()

  // Verify employee exists
  const employee = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.id, data.employeeId),
        eq(employees.userId, userId)
      )
    )

  if (!employee.length) {
    throw new Error('Employee not found')
  }

  const result = await db
    .insert(performanceReviews)
    .values({
      userId,
      employeeId: data.employeeId,
      reviewerId: userId,
      rating: data.rating.toString(),
      comments: data.comments,
      reviewDate: new Date(data.reviewDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  revalidatePath('/dashboard/performance')
  return result[0]
}

export async function updatePerformanceReview(
  id: number,
  data: {
    rating?: number
    comments?: string
    reviewDate?: string
  }
) {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(performanceReviews)
    .where(
      and(
        eq(performanceReviews.id, id),
        eq(performanceReviews.userId, userId)
      )
    )

  if (!existing.length) {
    throw new Error('Review not found')
  }

  const result = await db
    .update(performanceReviews)
    .set({
      rating: data.rating?.toString(),
      comments: data.comments,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(performanceReviews.id, id))
    .returning()

  revalidatePath('/dashboard/performance')
  return result[0]
}

export async function deletePerformanceReview(id: number) {
  const userId = await getUserId()

  const result = await db
    .delete(performanceReviews)
    .where(
      and(
        eq(performanceReviews.id, id),
        eq(performanceReviews.userId, userId)
      )
    )
    .returning()

  revalidatePath('/dashboard/performance')
  return result[0]
}

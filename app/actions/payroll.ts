'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payroll, employees } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getPayrollRecords() {
  const userId = await getUserId()
  return db
    .select()
    .from(payroll)
    .where(eq(payroll.userId, userId))
    .orderBy(desc(payroll.createdAt))
}

export async function getPayrollByMonth(month: number, year: number) {
  const userId = await getUserId()
  return db
    .select({
      id: payroll.id,
      employeeId: payroll.employeeId,
      employeeName: employees.name,
      position: employees.position,
      baseSalary: payroll.baseSalary,
      deductions: payroll.deductions,
      bonus: payroll.bonus,
      netSalary: payroll.netSalary,
      status: payroll.status,
      createdAt: payroll.createdAt,
    })
    .from(payroll)
    .leftJoin(employees, eq(payroll.employeeId, employees.id))
    .where(
      and(
        eq(payroll.userId, userId),
        eq(payroll.month, month),
        eq(payroll.year, year)
      )
    )
    .orderBy(payroll.employeeId)
}

export async function getPayrollByEmployee(employeeId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(payroll)
    .where(
      and(
        eq(payroll.userId, userId),
        eq(payroll.employeeId, employeeId)
      )
    )
    .orderBy(desc(payroll.year), desc(payroll.month))
}

export async function createPayroll(data: {
  employeeId: number
  month: number
  year: number
  baseSalary: number
  deductions?: number
  bonus?: number
}) {
  const userId = await getUserId()

  // Verify employee exists and belongs to user
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

  const baseSalary = parseFloat(String(data.baseSalary))
  const deductions = parseFloat(String(data.deductions || 0))
  const bonus = parseFloat(String(data.bonus || 0))
  const netSalary = baseSalary - deductions + bonus

  const result = await db
    .insert(payroll)
    .values({
      userId,
      employeeId: data.employeeId,
      month: data.month,
      year: data.year,
      baseSalary: baseSalary.toString(),
      deductions: deductions.toString(),
      bonus: bonus.toString(),
      netSalary: netSalary.toString(),
      status: 'pending',
    })
    .returning()

  revalidatePath('/dashboard/payroll')
  return result[0]
}

export async function updatePayroll(
  id: number,
  data: {
    baseSalary?: number
    deductions?: number
    bonus?: number
    status?: string
  }
) {
  const userId = await getUserId()

  // Get existing record
  const existing = await db
    .select()
    .from(payroll)
    .where(
      and(
        eq(payroll.id, id),
        eq(payroll.userId, userId)
      )
    )

  if (!existing.length) {
    throw new Error('Payroll record not found')
  }

  const record = existing[0]
  const baseSalary = parseFloat(String(data.baseSalary ?? record.baseSalary))
  const deductions = parseFloat(String(data.deductions ?? record.deductions))
  const bonus = parseFloat(String(data.bonus ?? record.bonus))
  const netSalary = baseSalary - deductions + bonus

  const result = await db
    .update(payroll)
    .set({
      baseSalary: baseSalary.toString(),
      deductions: deductions.toString(),
      bonus: bonus.toString(),
      netSalary: netSalary.toString(),
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(payroll.id, id))
    .returning()

  revalidatePath('/dashboard/payroll')
  return result[0]
}

export async function deletePayroll(id: number) {
  const userId = await getUserId()

  const result = await db
    .delete(payroll)
    .where(
      and(
        eq(payroll.id, id),
        eq(payroll.userId, userId)
      )
    )
    .returning()

  revalidatePath('/dashboard/payroll')
  return result[0]
}

export async function processPayroll(month: number, year: number) {
  const userId = await getUserId()

  // Get all active employees
  const allEmployees = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.userId, userId),
        eq(employees.status, 'active')
      )
    )

  const processed = []

  for (const emp of allEmployees) {
    // Check if payroll already exists
    const existing = await db
      .select()
      .from(payroll)
      .where(
        and(
          eq(payroll.employeeId, emp.id),
          eq(payroll.month, month),
          eq(payroll.year, year)
        )
      )

    if (!existing.length && emp.salary) {
      const baseSalary = parseFloat(String(emp.salary))
      const deductions = Math.round(baseSalary * 0.1) // 10% default deduction
      const bonus = 0
      const netSalary = baseSalary - deductions + bonus

      const result = await db
        .insert(payroll)
        .values({
          userId,
          employeeId: emp.id,
          month,
          year,
          baseSalary: baseSalary.toString(),
          deductions: deductions.toString(),
          bonus: bonus.toString(),
          netSalary: netSalary.toString(),
          status: 'pending',
        })
        .returning()

      processed.push(result[0])
    }
  }

  revalidatePath('/dashboard/payroll')
  return processed
}

export async function approvePayroll(id: number) {
  const userId = await getUserId()

  const result = await db
    .update(payroll)
    .set({
      status: 'approved',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(payroll.id, id),
        eq(payroll.userId, userId)
      )
    )
    .returning()

  revalidatePath('/dashboard/payroll')
  return result[0]
}

export async function getPayrollStats(year: number) {
  const userId = await getUserId()

  const stats = await db
    .select({
      month: payroll.month,
      totalPayroll: sql<number>`SUM(CAST(${payroll.netSalary} as NUMERIC))`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payroll)
    .where(
      and(
        eq(payroll.userId, userId),
        eq(payroll.year, year)
      )
    )
    .groupBy(payroll.month)
    .orderBy(payroll.month)

  return stats
}

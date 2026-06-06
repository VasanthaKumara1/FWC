'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { employees, departments } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getEmployees() {
  const userId = await getUserId()
  return db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .orderBy(desc(employees.createdAt))
}

export async function getEmployeeById(id: number) {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(employees)
    .where(and(eq(employees.id, id), eq(employees.userId, userId)))
  return result[0] || null
}

export async function createEmployee(data: {
  name: string
  email: string
  phoneNumber?: string
  position: string
  dateOfJoining: string
  salary?: number
  departmentId?: number
  address?: string
}) {
  const userId = await getUserId()
  const result = await db
    .insert(employees)
    .values({
      userId,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      position: data.position,
      dateOfJoining: new Date(data.dateOfJoining),
      salary: data.salary ? String(data.salary) : null,
      departmentId: data.departmentId,
      address: data.address,
    })
    .returning()

  revalidatePath('/dashboard/employees')
  return result[0]
}

export async function updateEmployee(
  id: number,
  data: {
    name?: string
    email?: string
    phoneNumber?: string
    position?: string
    dateOfJoining?: string
    salary?: number
    departmentId?: number
    status?: string
    address?: string
  }
) {
  const userId = await getUserId()
  const updateData: Record<string, any> = {}

  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email
  if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber
  if (data.position) updateData.position = data.position
  if (data.dateOfJoining)
    updateData.dateOfJoining = new Date(data.dateOfJoining)
  if (data.salary !== undefined)
    updateData.salary = data.salary ? String(data.salary) : null
  if (data.departmentId !== undefined) updateData.departmentId = data.departmentId
  if (data.status) updateData.status = data.status
  if (data.address) updateData.address = data.address
  updateData.updatedAt = new Date()

  const result = await db
    .update(employees)
    .set(updateData)
    .where(and(eq(employees.id, id), eq(employees.userId, userId)))
    .returning()

  revalidatePath('/dashboard/employees')
  return result[0]
}

export async function deleteEmployee(id: number) {
  const userId = await getUserId()
  await db
    .delete(employees)
    .where(and(eq(employees.id, id), eq(employees.userId, userId)))

  revalidatePath('/dashboard/employees')
}

export async function getDepartments() {
  const userId = await getUserId()
  return db
    .select()
    .from(departments)
    .where(eq(departments.userId, userId))
    .orderBy(desc(departments.createdAt))
}

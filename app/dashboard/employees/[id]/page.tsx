'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import EmployeeForm from '@/components/employee-form'
import { getEmployeeById } from '@/app/actions/employees'

interface Employee {
  id: number
  name: string
  email: string
  phoneNumber?: string | null
  position: string
  dateOfJoining: Date
  salary: string | null
  departmentId?: number | null
  address?: string
  status: string
}

export default function EditEmployeePage() {
  const params = useParams()
  const id = parseInt(params.id as string)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await getEmployeeById(id)
        if (data) {
          setEmployee({
            ...data,
            dateOfJoining: new Date(data.dateOfJoining)
              .toISOString()
              .split('T')[0] as unknown as Date,
          })
        }
      } catch (error) {
        console.error('Failed to fetch employee:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [id])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!employee) {
    return <div className="text-center py-8">Employee not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
        <p className="mt-1 text-gray-600">Update employee information</p>
      </div>
      <EmployeeForm initialData={employee} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createEmployee, updateEmployee } from '@/app/actions/employees'

interface EmployeeFormProps {
  initialData?: {
    id: number
    name: string
    email: string
    phoneNumber?: string
    position: string
    dateOfJoining: string
    salary?: number
    departmentId?: number
    address?: string
    status?: string
  }
}

export default function EmployeeForm({ initialData }: EmployeeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      email: '',
      phoneNumber: '',
      position: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: 0,
      departmentId: undefined,
      address: '',
      status: 'active',
    }
  )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salary' ? (value ? parseFloat(value) : 0) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (initialData?.id) {
        await updateEmployee(initialData.id, formData)
      } else {
        await createEmployee(formData)
      }
      router.push('/dashboard/employees')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save employee'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Employee' : 'Add New Employee'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <Input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Software Engineer"
                required
              />
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Joining *
              </label>
              <Input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                required
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <Input
                type="number"
                name="salary"
                value={formData.salary || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Street address, city, state, zip code"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : initialData ? 'Update Employee' : 'Add Employee'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

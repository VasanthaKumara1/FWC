'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEmployees, deleteEmployee } from '@/app/actions/employees'
import { Input } from '@/components/ui/input'

interface Employee {
  id: number
  name: string
  email: string
  position: string
  salary: string | null
  status: string
  dateOfJoining: Date
  phoneNumber?: string | null
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees)
    } else {
      setFilteredEmployees(
        employees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, employees])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await getEmployees()
      setEmployees(data as unknown as Employee[])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id)
        setEmployees(employees.filter((emp) => emp.id !== id))
      } catch (error) {
        console.error('Failed to delete employee:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-gray-600">Manage your workforce</p>
        </div>
        <Link href="/dashboard/employees/new">
          <Button>+ Add Employee</Button>
        </Link>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search by name, email, or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {employees.length === 0
                ? 'No employees found. Create one to get started.'
                : 'No employees match your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.position}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.phoneNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

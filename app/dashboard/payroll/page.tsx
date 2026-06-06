'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getPayrollByMonth,
  createPayroll,
  updatePayroll,
  deletePayroll,
  processPayroll,
  approvePayroll,
} from '@/app/actions/payroll'
import { getEmployees } from '@/app/actions/employees'

interface PayrollRecord {
  id: number
  employeeId: number
  employeeName: string
  position: string
  baseSalary: string
  deductions: string
  bonus: string
  netSalary: string
  status: string
}

interface Employee {
  id: number
  name: string
  salary: string | null
  position: string
}

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    employeeId: '',
    baseSalary: '',
    deductions: '',
    bonus: '',
  })

  useEffect(() => {
    loadData()
  }, [selectedMonth, selectedYear])

  const loadData = async () => {
    try {
      setLoading(true)
      const [payrollData, employeeData] = await Promise.all([
        getPayrollByMonth(selectedMonth, selectedYear),
        getEmployees(),
      ])
      setPayrollRecords(payrollData)
      setEmployees(employeeData)
    } catch (err) {
      setError('Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        employeeId: parseInt(formData.employeeId),
        month: selectedMonth,
        year: selectedYear,
        baseSalary: parseFloat(formData.baseSalary),
        deductions: parseFloat(formData.deductions) || 0,
        bonus: parseFloat(formData.bonus) || 0,
      }

      await createPayroll(data)
      setFormData({ employeeId: '', baseSalary: '', deductions: '', bonus: '' })
      setShowForm(false)
      loadData()
    } catch (err) {
      setError('Failed to create payroll')
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await approvePayroll(id)
      loadData()
    } catch (err) {
      setError('Failed to approve payroll')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    try {
      await deletePayroll(id)
      loadData()
    } catch (err) {
      setError('Failed to delete payroll')
    }
  }

  const handleProcessPayroll = async () => {
    try {
      await processPayroll(selectedMonth, selectedYear)
      loadData()
    } catch (err) {
      setError('Failed to process payroll')
    }
  }

  const totalPayroll = payrollRecords.reduce(
    (sum, r) => sum + parseFloat(r.netSalary),
    0
  )

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString(
    'default',
    { month: 'long' }
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payroll</h1>
          <p className="text-gray-600">Manage salaries and payroll processing</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(selectedYear, m - 1).toLocaleString('default', {
                      month: 'long',
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleProcessPayroll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Process Payroll
              </Button>
              <Button
                onClick={() => {
                  setShowForm(!showForm)
                  setEditingId(null)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                {showForm ? 'Cancel' : 'Add Payroll'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Payroll' : 'Create Payroll'}
            </h2>
            <form onSubmit={handleCreatePayroll} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Salary
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, baseSalary: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deductions
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(e) =>
                      setFormData({ ...formData, deductions: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.bonus}
                    onChange={(e) =>
                      setFormData({ ...formData, bonus: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Payroll
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      employeeId: '',
                      baseSalary: '',
                      deductions: '',
                      bonus: '',
                    })
                  }}
                  className="bg-gray-400 hover:bg-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Total Records</p>
            <p className="text-3xl font-bold text-gray-900">
              {payrollRecords.length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Month</p>
            <p className="text-3xl font-bold text-gray-900">
              {monthName} {selectedYear}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Total Payroll</p>
            <p className="text-3xl font-bold text-green-600">
              ${totalPayroll.toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Loading payroll data...</p>
          </Card>
        ) : payrollRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No payroll records for {monthName} {selectedYear}
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Position
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.employeeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.position}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                      ${parseFloat(record.baseSalary).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      ${parseFloat(record.deductions).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      ${parseFloat(record.bonus).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      ${parseFloat(record.netSalary).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        {record.status === 'pending' && (
                          <Button
                            onClick={() => handleApprove(record.id)}
                            className="text-xs bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(record.id)}
                          className="text-xs bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

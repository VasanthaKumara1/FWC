'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEmployees } from '@/app/actions/employees'
import {
  getLeaveRequests,
  applyLeave,
  updateLeaveStatus,
  getLeaveBalance,
} from '@/app/actions/leaves'
import { Input } from '@/components/ui/input'

interface LeaveRequest {
  id: number
  employeeId: number
  leaveType: string
  startDate: Date
  endDate: Date
  reason?: string
  status: string
}

interface Employee {
  id: number
  name: string
}

export default function LeavesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    employeeId: 0,
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [leaveBalance, setLeaveBalance] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      fetchLeaveBalance(selectedEmployee)
    }
  }, [selectedEmployee])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [empData, leaveData] = await Promise.all([
        getEmployees(),
        getLeaveRequests(),
      ])
      setEmployees(empData as unknown as Employee[])
      setLeaveRequests(leaveData as unknown as LeaveRequest[])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveBalance = async (employeeId: number) => {
    try {
      const balance = await getLeaveBalance(employeeId)
      setLeaveBalance(balance)
    } catch (error) {
      console.error('Failed to fetch leave balance:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await applyLeave({
        ...formData,
        employeeId: selectedEmployee || formData.employeeId,
      })
      setShowForm(false)
      setFormData({
        employeeId: 0,
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to apply leave:', error)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await updateLeaveStatus(id, 'approved')
      await fetchData()
    } catch (error) {
      console.error('Failed to approve leave:', error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await updateLeaveStatus(id, 'rejected')
      await fetchData()
    } catch (error) {
      console.error('Failed to reject leave:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaves</h1>
          <p className="mt-1 text-gray-600">Manage employee leave requests</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Request Leave'}
        </Button>
      </div>

      {/* Apply Leave Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {leaveBalance && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-900">
                    Leave Balance: {leaveBalance.remainingBalance} days remaining
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) =>
                      setFormData({ ...formData, leaveType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                    <option value="casual">Casual</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Reason for leave"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leave requests found
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Employee #{request.employeeId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.leaveType} Leave:{' '}
                      {new Date(request.startDate).toLocaleDateString()} to{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    {request.reason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {request.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status}
                    </span>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(request.id)}
                          className="text-green-600 border-green-600"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

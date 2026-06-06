'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getEmployees,
  getDepartments,
} from '@/app/actions/employees'
import {
  checkIn,
  checkOut,
  getAttendanceRecords,
} from '@/app/actions/attendance'
import { Input } from '@/components/ui/input'

interface AttendanceRecord {
  id: number
  employeeId: number
  date: string
  checkInTime: Date | null
  checkOutTime: Date | null
  status: string
}

interface Employee {
  id: number
  name: string
  position: string
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [checkedInToday, setCheckedInToday] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [empData, attData] = await Promise.all([
        getEmployees(),
        getAttendanceRecords(),
      ])
      setEmployees(empData as unknown as Employee[])
      setAttendanceRecords(attData as unknown as AttendanceRecord[])

      // Track who's checked in today
      const today = new Date().toISOString().split('T')[0]
      const checkedIn = new Set(
        (attData as unknown as AttendanceRecord[])
          .filter(
            (record) =>
              record.date === today &&
              record.status === 'present' &&
              !record.checkOutTime
          )
          .map((r) => r.employeeId)
      )
      setCheckedInToday(checkedIn)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (employeeId: number) => {
    try {
      await checkIn(employeeId)
      setCheckedInToday(new Set([...checkedInToday, employeeId]))
      await fetchData()
    } catch (error) {
      console.error('Check-in failed:', error)
      alert(error instanceof Error ? error.message : 'Check-in failed')
    }
  }

  const handleCheckOut = async (employeeId: number) => {
    try {
      await checkOut(employeeId)
      setCheckedInToday(
        new Set([...checkedInToday].filter((id) => id !== employeeId))
      )
      await fetchData()
    } catch (error) {
      console.error('Check-out failed:', error)
      alert(error instanceof Error ? error.message : 'Check-out failed')
    }
  }

  const filteredRecords = attendanceRecords.filter((record) => {
    if (selectedEmployeeId && record.employeeId !== selectedEmployeeId)
      return false
    if (startDate && record.date < startDate) return false
    if (endDate && record.date > endDate) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="mt-1 text-gray-600">
          Track employee attendance and check-ins
        </p>
      </div>

      {/* Quick Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in / Check-out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="text-gray-500">Loading employees...</div>
            ) : employees.length === 0 ? (
              <div className="text-gray-500">No employees found</div>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  className="border rounded-lg p-4 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                    <p className="text-sm text-gray-600">{emp.position}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {checkedInToday.has(emp.id) ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCheckOut(emp.id)}
                        className="w-full"
                      >
                        Check Out
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(emp.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                value={selectedEmployeeId || ''}
                onChange={(e) =>
                  setSelectedEmployeeId(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Records Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Check-out
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.employeeId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.checkInTime
                          ? new Date(record.checkInTime).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.checkOutTime
                          ? new Date(record.checkOutTime).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </span>
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

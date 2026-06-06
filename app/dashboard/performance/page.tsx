'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  getPerformanceStats,
} from '@/app/actions/performance'
import { getEmployees } from '@/app/actions/employees'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface PerformanceReview {
  id: number
  employeeId: number
  employeeName: string
  position: string
  rating: string
  comments: string
  reviewDate: string
  reviewerId: string
  createdAt: Date
}

interface Employee {
  id: number
  name: string
  position: string
  status: string
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    excellentCount: 0,
    goodCount: 0,
    averageCount: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    employeeId: '',
    rating: '4.0',
    comments: '',
    reviewDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reviewData, employeeData, statsData] = await Promise.all([
        getPerformanceReviews(),
        getEmployees(),
        getPerformanceStats(),
      ])
      setReviews(reviewData)
      setEmployees(employeeData)
      setStats(statsData)
    } catch (err) {
      setError('Failed to load performance data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPerformanceReview({
        employeeId: parseInt(formData.employeeId),
        rating: parseFloat(formData.rating),
        comments: formData.comments,
        reviewDate: formData.reviewDate,
      })
      setFormData({
        employeeId: '',
        rating: '4.0',
        comments: '',
        reviewDate: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
      loadData()
    } catch (err) {
      setError('Failed to create review')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    try {
      await deletePerformanceReview(id)
      loadData()
    } catch (err) {
      setError('Failed to delete review')
    }
  }

  const ratingDistribution = [
    { name: 'Excellent (4.5-5.0)', value: stats.excellentCount },
    { name: 'Good (3.5-4.4)', value: stats.goodCount },
    { name: 'Average (< 3.5)', value: stats.averageCount },
  ]

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Reviews
          </h1>
          <p className="text-gray-600">Track employee performance ratings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Average Rating</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalReviews}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Excellent</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.excellentCount}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-sm">Active Employees</p>
            <p className="text-3xl font-bold text-gray-900">
              {employees.filter((e) => e.status === 'active').length}
            </p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Rating Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Rating Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Excellent (4.5-5.0)
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {stats.excellentCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalReviews > 0
                          ? (stats.excellentCount / stats.totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Good (3.5-4.4)
                  </span>
                  <span className="text-sm font-bold text-yellow-600">
                    {stats.goodCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalReviews > 0
                          ? (stats.goodCount / stats.totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Average (&lt; 3.5)
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {stats.averageCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalReviews > 0
                          ? (stats.averageCount / stats.totalReviews) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 p-6">
            <h2 className="text-xl font-bold mb-4">Create Performance Review</h2>
            <form onSubmit={handleCreateReview} className="space-y-4">
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
                    {employees
                      .filter((e) => e.status === 'active')
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Date
                  </label>
                  <Input
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) =>
                    setFormData({ ...formData, comments: e.target.value })
                  }
                  placeholder="Enter performance review comments..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Review
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      employeeId: '',
                      rating: '4.0',
                      comments: '',
                      reviewDate: new Date().toISOString().split('T')[0],
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

        {/* Add Button */}
        {!showForm && (
          <div className="mb-6">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Performance Review
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Loading performance data...</p>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No performance reviews yet</p>
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
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Review Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {review.employeeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {review.position}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          parseFloat(review.rating) >= 4.5
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(review.rating) >= 3.5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {review.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="line-clamp-2">{review.comments}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <Button
                        onClick={() => handleDelete(review.id)}
                        className="text-xs bg-red-600 hover:bg-red-700"
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
      </div>
    </div>
  )
}

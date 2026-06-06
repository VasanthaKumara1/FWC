import EmployeeForm from '@/components/employee-form'

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Employee</h1>
        <p className="mt-1 text-gray-600">
          Create a new employee record in your system
        </p>
      </div>
      <EmployeeForm />
    </div>
  )
}

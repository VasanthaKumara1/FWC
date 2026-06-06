import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { user, departments, employees, attendance, leaves, payroll, performanceReviews } from '../lib/db/schema'
import { nanoid } from 'nanoid'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool, { 
  schema: { user, departments, employees, attendance, leaves, payroll, performanceReviews }
})

async function seed() {
  console.log('Seeding database...')

  try {
    // Create test user
    const userId = nanoid()
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(user)

    if (existingUsers.length === 0) {
      await db.insert(user).values({
        id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('✓ Created test user')
    } else {
      console.log('✓ Test user already exists')
      // Use the existing user's ID
      const existingUser = existingUsers[0]
      userId = existingUser.id
    }

    // Create departments
    const deptSales = await db
      .insert(departments)
      .values({
        userId,
        name: 'Sales',
        description: 'Sales and Business Development',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    const deptEngineering = await db
      .insert(departments)
      .values({
        userId,
        name: 'Engineering',
        description: 'Product and Software Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    const deptHR = await db
      .insert(departments)
      .values({
        userId,
        name: 'Human Resources',
        description: 'HR and Administration',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    console.log('✓ Created departments')

    // Create employees
    const employees = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        position: 'Sales Manager',
        salary: 75000,
        departmentId: deptSales[0].id,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        position: 'Senior Engineer',
        salary: 95000,
        departmentId: deptEngineering[0].id,
      },
      {
        name: 'Mike Davis',
        email: 'mike@example.com',
        position: 'Software Engineer',
        salary: 80000,
        departmentId: deptEngineering[0].id,
      },
      {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        position: 'HR Specialist',
        salary: 65000,
        departmentId: deptHR[0].id,
      },
      {
        name: 'Alex Brown',
        email: 'alex@example.com',
        position: 'Sales Executive',
        salary: 60000,
        departmentId: deptSales[0].id,
      },
    ]

    const createdEmployees = []
    for (const emp of employees) {
      const result = await db
        .insert(employees as any)
        .values({
          userId,
          departmentId: emp.departmentId,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          salary: emp.salary.toString(),
          dateOfJoining: new Date(2023, 0, 15),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      createdEmployees.push(result[0])
    }

    console.log('✓ Created employees')

    // Create attendance records for the current month
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()

    for (const emp of createdEmployees) {
      for (let day = 1; day <= 22; day++) {
        const date = new Date(currentYear, currentMonth - 1, day)
        const dayOfWeek = date.getDay()

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        const checkInTime = new Date(date)
        checkInTime.setHours(9, Math.floor(Math.random() * 30), 0)

        const checkOutTime = new Date(date)
        checkOutTime.setHours(17, Math.floor(Math.random() * 60), 0)

        await db
          .insert(attendance)
          .values({
            userId,
            employeeId: emp.id,
            checkInTime,
            checkOutTime,
            date: date.toISOString().split('T')[0] as any,
            status: 'present',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
      }
    }

    console.log('✓ Created attendance records')

    // Create leave records
    const leaveTypes = ['Sick Leave', 'Casual Leave', 'Annual Leave']

    for (let i = 0; i < 5; i++) {
      const emp = createdEmployees[Math.floor(Math.random() * createdEmployees.length)]
      const startDate = new Date(currentYear, currentMonth - 1, Math.floor(Math.random() * 15) + 1)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1)

      await db
        .insert(leaves)
        .values({
          userId,
          employeeId: emp.id,
          leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
          startDate: startDate.toISOString().split('T')[0] as any,
          endDate: endDate.toISOString().split('T')[0] as any,
          reason: 'Personal reason',
          status: Math.random() > 0.5 ? 'approved' : 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    }

    console.log('✓ Created leave records')

    // Create payroll records for current month
    for (const emp of createdEmployees) {
      const salary = parseFloat(emp.salary || '0')
      const deductions = Math.round(salary * 0.1)
      const bonus = 0
      const netSalary = salary - deductions + bonus

      await db
        .insert(payroll)
        .values({
          userId,
          employeeId: emp.id,
          month: currentMonth,
          year: currentYear,
          baseSalary: salary.toString(),
          deductions: deductions.toString(),
          bonus: bonus.toString(),
          netSalary: netSalary.toString(),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    }

    console.log('✓ Created payroll records')

    // Create performance reviews
    const ratings = ['3.5', '4.0', '4.5', '5.0']

    for (let i = 0; i < 3; i++) {
      const emp = createdEmployees[Math.floor(Math.random() * createdEmployees.length)]
      const reviewDate = new Date(currentYear, currentMonth - 1, Math.floor(Math.random() * 15) + 1)

      await db
        .insert(performanceReviews)
        .values({
          userId,
          employeeId: emp.id,
          reviewerId: userId,
          rating: ratings[Math.floor(Math.random() * ratings.length)] as any,
          comments: 'Good performance this period',
          reviewDate: reviewDate.toISOString().split('T')[0] as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    }

    console.log('✓ Created performance reviews')

    console.log('\n✅ Database seeding complete!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()

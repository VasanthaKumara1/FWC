import { relations } from 'drizzle-orm'
import {
  text,
  timestamp,
  boolean,
  serial,
  date,
  decimal,
  jsonb,
  pgTable,
  index,
} from 'drizzle-orm/pg-core'

// Better Auth Tables (Required)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userIdIndex: index('session_userId_index').on(table.userId),
  })
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('account_userId_index').on(table.userId),
  })
)

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// HR Management Tables
export const departments = pgTable(
  'departments',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_departments_userId').on(table.userId),
  })
)

export const employees = pgTable(
  'employees',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    departmentId: serial('departmentId'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phoneNumber: text('phoneNumber'),
    position: text('position').notNull(),
    dateOfJoining: date('dateOfJoining').notNull(),
    salary: decimal('salary', { precision: 12, scale: 2 }),
    status: text('status').default('active'),
    address: text('address'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_employees_userId').on(table.userId),
  })
)

export const attendance = pgTable(
  'attendance',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    employeeId: serial('employeeId').notNull(),
    checkInTime: timestamp('checkInTime'),
    checkOutTime: timestamp('checkOutTime'),
    date: date('date').notNull(),
    status: text('status').default('absent'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_attendance_userId').on(table.userId),
    dateIndex: index('idx_attendance_date').on(table.date),
  })
)

export const leaves = pgTable(
  'leaves',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    employeeId: serial('employeeId').notNull(),
    leaveType: text('leaveType').notNull(),
    startDate: date('startDate').notNull(),
    endDate: date('endDate').notNull(),
    reason: text('reason'),
    status: text('status').default('pending'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_leaves_userId').on(table.userId),
  })
)

export const payroll = pgTable(
  'payroll',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    employeeId: serial('employeeId').notNull(),
    month: serial('month').notNull(),
    year: serial('year').notNull(),
    baseSalary: decimal('baseSalary', { precision: 12, scale: 2 }).notNull(),
    deductions: decimal('deductions', { precision: 12, scale: 2 }).default('0'),
    bonus: decimal('bonus', { precision: 12, scale: 2 }).default('0'),
    netSalary: decimal('netSalary', { precision: 12, scale: 2 }).notNull(),
    status: text('status').default('pending'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_payroll_userId').on(table.userId),
  })
)

export const performanceReviews = pgTable(
  'performance_reviews',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    employeeId: serial('employeeId').notNull(),
    reviewerId: text('reviewerId'),
    rating: decimal('rating', { precision: 3, scale: 1 }),
    comments: text('comments'),
    reviewDate: date('reviewDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_performance_userId').on(table.userId),
  })
)

export const analyticsSnapshots = pgTable(
  'analytics_snapshots',
  {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    metricType: text('metric_type').notNull(),
    metricValue: jsonb('metric_value'),
    snapshotDate: date('snapshotDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    userIdIndex: index('idx_analytics_userId').on(table.userId),
  })
)

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

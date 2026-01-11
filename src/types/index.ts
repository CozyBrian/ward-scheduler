// Data types for Ward Schedule Timetable

export type ShiftType = 'M' | 'A' | 'E' | 'X'

export interface Person {
  id: string
  name: string
  departmentId?: string
  offWeekdays?: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
] as const

export interface Department {
  id: string
  name: string
}

export interface ShiftAssignment {
  personId: string
  date: string // ISO date string YYYY-MM-DD
  shift: ShiftType
  hasViolation?: boolean
}

export interface Timetable {
  id: string
  name: string
  startDate: string
  endDate: string
  assignments: ShiftAssignment[]
  createdAt: string
  updatedAt: string
}

export interface AppState {
  people: Person[]
  departments: Department[]
  timetables: Timetable[]
  currentTimetableId: string | null
  settings: {
    colorMode: boolean
    groupByDepartment: boolean
  }
}

export const SHIFT_COLORS: Record<ShiftType, string> = {
  M: 'bg-sky-300 text-black',
  A: 'bg-orange-300 text-black',
  E: 'bg-slate-800 text-white',
  X: 'bg-gray-400 text-white',
}

export const SHIFT_LABELS: Record<ShiftType, string> = {
  M: 'Morning',
  A: 'Afternoon',
  E: 'Evening',
  X: 'Off',
}

export const SHIFTS: ShiftType[] = ['M', 'A', 'E', 'X']

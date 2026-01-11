import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Person, Department, Timetable, ShiftAssignment, ShiftType, AppState } from '@/types'

interface HistoryState {
  past: Timetable[]
  future: Timetable[]
}

interface StoreState extends AppState {
  history: HistoryState
  
  // Person actions
  addPerson: (person: Omit<Person, 'id'>) => void
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
  
  // Department actions
  addDepartment: (department: Omit<Department, 'id'>) => void
  updateDepartment: (id: string, updates: Partial<Department>) => void
  deleteDepartment: (id: string) => void
  
  // Timetable actions
  createTimetable: (name: string, startDate: string, endDate: string) => void
  setCurrentTimetable: (id: string | null) => void
  deleteTimetable: (id: string) => void
  renameTimetable: (id: string, name: string) => void
  
  // Assignment actions
  setAssignment: (personId: string, date: string, shift: ShiftType) => void
  generateSchedule: () => void
  
  // Settings actions
  toggleColorMode: () => void
  toggleGroupByDepartment: () => void
  
  // History actions
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Import/Export
  exportData: () => string
  importData: (data: string) => boolean
  
  // Helpers
  getCurrentTimetable: () => Timetable | null
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const saveToHistory = (state: StoreState, currentTimetable: Timetable): HistoryState => ({
  past: [...state.history.past, JSON.parse(JSON.stringify(currentTimetable))].slice(-50),
  future: [],
})

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      people: [],
      departments: [],
      timetables: [],
      currentTimetableId: null,
      settings: {
        colorMode: false,
        groupByDepartment: false,
      },
      history: {
        past: [],
        future: [],
      },

      // Person actions
      addPerson: (person) => {
        const id = generateId()
        set((state) => ({
          people: [...state.people, { ...person, id }],
        }))
      },

      updatePerson: (id, updates) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      deletePerson: (id) => {
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
          timetables: state.timetables.map((t) => ({
            ...t,
            assignments: t.assignments.filter((a) => a.personId !== id),
          })),
        }))
      },

      // Department actions
      addDepartment: (department) => {
        const id = generateId()
        set((state) => ({
          departments: [...state.departments, { ...department, id }],
        }))
      },

      updateDepartment: (id, updates) => {
        set((state) => ({
          departments: state.departments.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }))
      },

      deleteDepartment: (id) => {
        set((state) => ({
          departments: state.departments.filter((d) => d.id !== id),
          people: state.people.map((p) =>
            p.departmentId === id ? { ...p, departmentId: undefined } : p
          ),
        }))
      },

      // Timetable actions
      createTimetable: (name, startDate, endDate) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newTimetable: Timetable = {
          id,
          name,
          startDate,
          endDate,
          assignments: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          timetables: [...state.timetables, newTimetable],
          currentTimetableId: id,
          history: { past: [], future: [] },
        }))
      },

      setCurrentTimetable: (id) => {
        set(() => ({
          currentTimetableId: id,
          history: { past: [], future: [] },
        }))
      },

      deleteTimetable: (id) => {
        set((state) => ({
          timetables: state.timetables.filter((t) => t.id !== id),
          currentTimetableId:
            state.currentTimetableId === id ? null : state.currentTimetableId,
        }))
      },

      renameTimetable: (id, name) => {
        set((state) => ({
          timetables: state.timetables.map((t) =>
            t.id === id ? { ...t, name, updatedAt: new Date().toISOString() } : t
          ),
        }))
      },

      // Assignment actions
      setAssignment: (personId, date, shift) => {
        const state = get()
        const currentTimetable = state.getCurrentTimetable()
        if (!currentTimetable) return

        set((state) => {
          const timetable = state.timetables.find(
            (t) => t.id === state.currentTimetableId
          )
          if (!timetable) return state

          const newHistory = saveToHistory(state, timetable)
          const existingIndex = timetable.assignments.findIndex(
            (a) => a.personId === personId && a.date === date
          )

          let newAssignments: ShiftAssignment[]
          if (existingIndex >= 0) {
            newAssignments = [...timetable.assignments]
            newAssignments[existingIndex] = { personId, date, shift }
          } else {
            newAssignments = [...timetable.assignments, { personId, date, shift }]
          }

          return {
            timetables: state.timetables.map((t) =>
              t.id === state.currentTimetableId
                ? { ...t, assignments: newAssignments, updatedAt: new Date().toISOString() }
                : t
            ),
            history: newHistory,
          }
        })
      },

      generateSchedule: () => {
        const state = get()
        const currentTimetable = state.getCurrentTimetable()
        if (!currentTimetable) return

        set((state) => {
          const timetable = state.timetables.find(
            (t) => t.id === state.currentTimetableId
          )
          if (!timetable) return state

          const newHistory = saveToHistory(state, timetable)
          const newAssignments = generateScheduleAssignments(
            state.people,
            timetable.startDate,
            timetable.endDate
          )

          return {
            timetables: state.timetables.map((t) =>
              t.id === state.currentTimetableId
                ? { ...t, assignments: newAssignments, updatedAt: new Date().toISOString() }
                : t
            ),
            history: newHistory,
          }
        })
      },

      // Settings actions
      toggleColorMode: () => {
        set((state) => ({
          settings: { ...state.settings, colorMode: !state.settings.colorMode },
        }))
      },

      toggleGroupByDepartment: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            groupByDepartment: !state.settings.groupByDepartment,
          },
        }))
      },

      // History actions
      undo: () => {
        const state = get()
        if (state.history.past.length === 0) return

        const currentTimetable = state.getCurrentTimetable()
        if (!currentTimetable) return

        const previous = state.history.past[state.history.past.length - 1]
        const newPast = state.history.past.slice(0, -1)

        set((state) => ({
          timetables: state.timetables.map((t) =>
            t.id === state.currentTimetableId ? previous : t
          ),
          history: {
            past: newPast,
            future: [currentTimetable, ...state.history.future],
          },
        }))
      },

      redo: () => {
        const state = get()
        if (state.history.future.length === 0) return

        const currentTimetable = state.getCurrentTimetable()
        if (!currentTimetable) return

        const next = state.history.future[0]
        const newFuture = state.history.future.slice(1)

        set((state) => ({
          timetables: state.timetables.map((t) =>
            t.id === state.currentTimetableId ? next : t
          ),
          history: {
            past: [...state.history.past, currentTimetable],
            future: newFuture,
          },
        }))
      },

      canUndo: () => get().history.past.length > 0,
      canRedo: () => get().history.future.length > 0,

      // Import/Export
      exportData: () => {
        const state = get()
        return JSON.stringify({
          people: state.people,
          departments: state.departments,
          timetables: state.timetables,
          settings: state.settings,
        }, null, 2)
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.people && parsed.departments && parsed.timetables) {
            set(() => ({
              people: parsed.people,
              departments: parsed.departments,
              timetables: parsed.timetables,
              settings: parsed.settings || { colorMode: false, groupByDepartment: false },
              currentTimetableId: null,
              history: { past: [], future: [] },
            }))
            return true
          }
          return false
        } catch {
          return false
        }
      },

      // Helpers
      getCurrentTimetable: () => {
        const state = get()
        return state.timetables.find((t) => t.id === state.currentTimetableId) || null
      },
    }),
    {
      name: 'ward-schedule-storage',
      partialize: (state) => ({
        people: state.people,
        departments: state.departments,
        timetables: state.timetables,
        currentTimetableId: state.currentTimetableId,
        settings: state.settings,
      }),
    }
  )
)

// Schedule generation algorithm
function generateScheduleAssignments(
  people: Person[],
  startDate: string,
  endDate: string
): ShiftAssignment[] {
  const assignments: ShiftAssignment[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Get all dates in range
  const dates: string[] = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  if (people.length === 0 || dates.length === 0) return assignments

  // Build a map of person ID to their off weekdays
  const personOffWeekdays: Map<string, Set<number>> = new Map()
  people.forEach((p) => {
    if (p.offWeekdays && p.offWeekdays.length > 0) {
      personOffWeekdays.set(p.id, new Set(p.offWeekdays))
    }
  })

  // Track shift counts for even distribution per person over time
  const personShiftCounts: Record<string, Record<ShiftType, number>> = {}
  people.forEach((p) => {
    personShiftCounts[p.id] = { M: 0, A: 0, E: 0, X: 0 }
  })

  // Track previous day's shift for each person (for X before E rule)
  const previousShift: Record<string, ShiftType | null> = {}
  people.forEach((p) => {
    previousShift[p.id] = null
  })

  for (const date of dates) {
    // Get the day of week for this date (0 = Sunday, 6 = Saturday)
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    
    // Track how many people are assigned to each shift TODAY
    const dailyShiftCounts: Record<ShiftType, number> = { M: 0, A: 0, E: 0, X: 0 }
    
    // Calculate target distribution for today
    // We want roughly equal distribution of M, A, E with some X
    const numPeople = people.length
    const targetPerWorkingShift = Math.floor(numPeople / 4) // Roughly 25% each for M, A, E, X
    
    const assignedToday: Set<string> = new Set()
    const shiftsToAssign: { personId: string; shift: ShiftType }[] = []

    // First: Assign fixed off weekdays (these take priority)
    for (const person of people) {
      const offDays = personOffWeekdays.get(person.id)
      if (offDays && offDays.has(dayOfWeek)) {
        shiftsToAssign.push({ personId: person.id, shift: 'X' })
        dailyShiftCounts.X++
        personShiftCounts[person.id].X++
        previousShift[person.id] = 'X'
        assignedToday.add(person.id)
      }
    }

    // Identify who CAN have E today (only those who had X yesterday and don't have fixed off today)
    const canHaveEvening: Set<string> = new Set()
    // Identify people who had X yesterday and SHOULD get E today (to complete the X->E pattern)
    const shouldHaveEvening: string[] = []
    
    for (const person of people) {
      if (assignedToday.has(person.id)) continue // Skip if already assigned (fixed off)
      
      if (previousShift[person.id] === 'X') {
        canHaveEvening.add(person.id)
        // Prioritize giving them E to complete the pattern
        shouldHaveEvening.push(person.id)
      }
    }

    // Shuffle for fairness
    const shuffledShouldEvening = [...shouldHaveEvening].sort(() => Math.random() - 0.5)

    // Second: Assign E shifts to people who had X yesterday (up to daily target)
    const eveningTarget = targetPerWorkingShift
    for (const personId of shuffledShouldEvening) {
      if (dailyShiftCounts.E >= eveningTarget) break
      
      shiftsToAssign.push({ personId, shift: 'E' })
      dailyShiftCounts.E++
      personShiftCounts[personId].E++
      previousShift[personId] = 'E'
      assignedToday.add(personId)
    }

    // Get remaining unassigned people
    const remainingPeople = people.filter(p => !assignedToday.has(p.id))
    const shuffledRemaining = [...remainingPeople].sort(() => Math.random() - 0.5)

    // Calculate remaining daily distribution
    const remainingCount = shuffledRemaining.length
    const idealPerShift = Math.ceil(remainingCount / 3) // Distribute among M, A, X (E already handled)
    const dailyTargets: Record<ShiftType, number> = {
      M: idealPerShift,
      A: idealPerShift,
      E: Math.max(0, eveningTarget - dailyShiftCounts.E), // Any remaining E slots
      X: idealPerShift
    }

    for (const person of shuffledRemaining) {
      // Find the best shift for this person considering:
      // 1. Their personal shift balance
      // 2. Today's shift distribution
      // 3. Rule: Can only have E if had X yesterday
      
      let bestShift: ShiftType = 'M'
      let bestScore = -Infinity

      // Available shifts for this person (E only if they had X yesterday)
      const availableShifts: ShiftType[] = canHaveEvening.has(person.id) 
        ? ['M', 'A', 'E', 'X'] 
        : ['M', 'A', 'X']
      
      for (const shift of availableShifts) {
        // Skip if we've hit the daily target for this shift
        if (dailyShiftCounts[shift] >= dailyTargets[shift] && 
            availableShifts.some(s => dailyShiftCounts[s] < dailyTargets[s])) {
          continue
        }

        // Score based on how much this person needs this shift
        // Lower personal count = higher score (they need it more)
        const personalNeed = -personShiftCounts[person.id][shift]
        
        // Also consider daily balance - prefer shifts that are under-assigned today
        const dailyNeed = dailyTargets[shift] - dailyShiftCounts[shift]
        
        const score = personalNeed * 2 + dailyNeed
        
        if (score > bestScore) {
          bestScore = score
          bestShift = shift
        }
      }

      shiftsToAssign.push({ personId: person.id, shift: bestShift })
      dailyShiftCounts[bestShift]++
      personShiftCounts[person.id][bestShift]++
      previousShift[person.id] = bestShift
    }

    // Add all assignments for this day
    for (const { personId, shift } of shiftsToAssign) {
      assignments.push({ personId, date, shift })
    }
  }

  return assignments
}

// Helper to check for violations
export function checkViolation(
  assignments: ShiftAssignment[],
  personId: string,
  date: string,
  shift: ShiftType
): boolean {
  if (shift !== 'E') return false

  // Check if previous day exists and is not X
  const prevDate = new Date(date)
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = prevDate.toISOString().split('T')[0]

  const prevAssignment = assignments.find(
    (a) => a.personId === personId && a.date === prevDateStr
  )

  // Violation: E shift without X on previous day
  return prevAssignment !== undefined && prevAssignment.shift !== 'X'
}

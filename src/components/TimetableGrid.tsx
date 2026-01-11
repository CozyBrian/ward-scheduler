import React, { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { useStore, checkViolation } from '@/store'
import { SHIFT_COLORS, SHIFTS, type ShiftType } from '@/types'
import { AlertTriangle } from 'lucide-react'

export function TimetableGrid() {
  const {
    people,
    departments,
    settings,
    getCurrentTimetable,
    setAssignment,
  } = useStore()

  const currentTimetable = getCurrentTimetable()

  const dates = useMemo(() => {
    if (!currentTimetable) return []
    const start = parseISO(currentTimetable.startDate)
    const end = parseISO(currentTimetable.endDate)
    const result: Date[] = []
    const current = new Date(start)
    while (current <= end) {
      result.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return result
  }, [currentTimetable])

  const sortedPeople = useMemo(() => {
    if (!settings.groupByDepartment) {
      return [...people].sort((a, b) => a.name.localeCompare(b.name))
    }

    const deptOrder = [...departments].sort((a, b) => a.name.localeCompare(b.name))
    const deptMap = new Map(deptOrder.map((d, i) => [d.id, i]))

    return [...people].sort((a, b) => {
      const aDept = a.departmentId ? deptMap.get(a.departmentId) ?? Infinity : Infinity
      const bDept = b.departmentId ? deptMap.get(b.departmentId) ?? Infinity : Infinity
      if (aDept !== bDept) return aDept - bDept
      return a.name.localeCompare(b.name)
    })
  }, [people, departments, settings.groupByDepartment])

  // Group people by department for rendering - must be before early returns (rules of hooks)
  const groupedPeople = useMemo(() => {
    if (!settings.groupByDepartment) {
      return [{ department: null, people: sortedPeople }]
    }

    const groups: { department: typeof departments[0] | null; people: typeof people }[] = []
    let currentDeptId: string | undefined | null = null
    let currentGroup: typeof people = []

    for (const person of sortedPeople) {
      if (person.departmentId !== currentDeptId) {
        if (currentGroup.length > 0) {
          const dept = currentDeptId ? departments.find((d) => d.id === currentDeptId) : null
          groups.push({ department: dept ?? null, people: currentGroup })
        }
        currentDeptId = person.departmentId
        currentGroup = [person]
      } else {
        currentGroup.push(person)
      }
    }

    if (currentGroup.length > 0) {
      const dept = currentDeptId ? departments.find((d) => d.id === currentDeptId) : null
      groups.push({ department: dept ?? null, people: currentGroup })
    }

    return groups
  }, [sortedPeople, departments, settings.groupByDepartment])

  const getShiftForPersonAndDate = (personId: string, date: string): ShiftType | null => {
    if (!currentTimetable) return null
    const assignment = currentTimetable.assignments.find(
      (a) => a.personId === personId && a.date === date
    )
    return assignment?.shift ?? null
  }

  const handleCellClick = (personId: string, dateStr: string) => {
    const currentShift = getShiftForPersonAndDate(personId, dateStr)
    const currentIndex = currentShift ? SHIFTS.indexOf(currentShift) : -1
    const nextIndex = (currentIndex + 1) % SHIFTS.length
    setAssignment(personId, dateStr, SHIFTS[nextIndex])
  }

  if (!currentTimetable) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Select or create a timetable to get started
      </div>
    )
  }

  if (people.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Add people to the schedule first
      </div>
    )
  }

  return (
    <div className="overflow-auto border rounded-lg">
      <table className="min-w-full border-collapse">
        <thead className="bg-muted sticky top-0 z-10">
          <tr>
            <th className="sticky left-0 z-20 bg-muted border-b border-r px-4 py-2 text-left font-medium min-w-[150px]">
              Name
            </th>
            {dates.map((date) => (
              <th
                key={date.toISOString()}
                className="border-b px-2 py-2 text-center font-medium min-w-[60px]"
              >
                <div className="text-xs text-muted-foreground">
                  {format(date, 'EEE')}
                </div>
                <div>{format(date, 'd')}</div>
                <div className="text-xs text-muted-foreground">
                  {format(date, 'MMM')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupedPeople.map((group, groupIndex) => (
            <React.Fragment key={`group-${groupIndex}`}>
              {settings.groupByDepartment && group.department && (
                <tr className="bg-muted/50">
                  <td
                    colSpan={dates.length + 1}
                    className="px-4 py-2 font-semibold text-sm border-b"
                  >
                    {group.department.name}
                  </td>
                </tr>
              )}
              {settings.groupByDepartment && !group.department && group.people.length > 0 && (
                <tr className="bg-muted/50">
                  <td
                    colSpan={dates.length + 1}
                    className="px-4 py-2 font-semibold text-sm text-muted-foreground border-b"
                  >
                    No Department
                  </td>
                </tr>
              )}
              {group.people.map((person) => (
                <tr key={person.id} className="hover:bg-muted/30">
                  <td className="sticky left-0 bg-background border-b border-r px-4 py-2 font-medium">
                    {person.name}
                  </td>
                  {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const shift = getShiftForPersonAndDate(person.id, dateStr)
                    const hasViolation = shift
                      ? checkViolation(
                          currentTimetable.assignments,
                          person.id,
                          dateStr,
                          shift
                        )
                      : false

                    return (
                      <td
                        key={dateStr}
                        className="border-b px-1 py-1 text-center"
                      >
                        <button
                          onClick={() => handleCellClick(person.id, dateStr)}
                          className={cn(
                            'w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm transition-all hover:scale-105 relative',
                            shift && settings.colorMode
                              ? SHIFT_COLORS[shift]
                              : 'bg-muted hover:bg-muted/80',
                            hasViolation && 'ring-2 ring-orange-500'
                          )}
                        >
                          {shift || '-'}
                          {hasViolation && (
                            <AlertTriangle className="absolute -top-1 -right-1 h-3 w-3 text-orange-500" />
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {settings.colorMode && (
        <div className="flex gap-4 p-4 border-t bg-muted/30">
          <span className="text-sm font-medium">Legend:</span>
          {SHIFTS.map((shift) => (
            <div key={shift} className="flex items-center gap-1">
              <div className={cn('w-6 h-6 rounded flex items-center justify-center text-xs font-bold', SHIFT_COLORS[shift])}>
                {shift}
              </div>
              <span className="text-sm">
                {shift === 'M' ? 'Morning' : shift === 'A' ? 'Afternoon' : shift === 'E' ? 'Evening' : 'Off'}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-4">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Rule violation</span>
          </div>
        </div>
      )}
    </div>
  )
}

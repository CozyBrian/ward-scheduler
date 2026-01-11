import { useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Download, Upload, FileDown, Printer } from 'lucide-react'

export function ExportImport() {
  const { exportData, importData, getCurrentTimetable, people, departments, settings } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ward-schedule-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const success = importData(content)
      if (success) {
        alert('Data imported successfully!')
      } else {
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExportCSV = () => {
    const timetable = getCurrentTimetable()
    if (!timetable) {
      alert('Please select a timetable first')
      return
    }

    const start = parseISO(timetable.startDate)
    const end = parseISO(timetable.endDate)
    const dates: string[] = []
    const current = new Date(start)
    while (current <= end) {
      dates.push(format(current, 'yyyy-MM-dd'))
      current.setDate(current.getDate() + 1)
    }

    // Sort people by department if grouping is enabled
    let sortedPeople = [...people]
    if (settings.groupByDepartment) {
      const deptOrder = [...departments].sort((a, b) => a.name.localeCompare(b.name))
      const deptMap = new Map(deptOrder.map((d, i) => [d.id, i]))
      sortedPeople = sortedPeople.sort((a, b) => {
        const aDept = a.departmentId ? deptMap.get(a.departmentId) ?? Infinity : Infinity
        const bDept = b.departmentId ? deptMap.get(b.departmentId) ?? Infinity : Infinity
        if (aDept !== bDept) return aDept - bDept
        return a.name.localeCompare(b.name)
      })
    } else {
      sortedPeople = sortedPeople.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Build CSV header
    const header = ['Name', ...dates.map((d) => format(parseISO(d), 'MMM d'))]
    
    // Build CSV rows
    const rows = sortedPeople.map((person) => {
      const shifts = dates.map((date) => {
        const assignment = timetable.assignments.find(
          (a) => a.personId === person.id && a.date === date
        )
        return assignment?.shift || '-'
      })
      return [person.name, ...shifts]
    })

    // Create CSV content
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${timetable.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-1" />
        Print
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportCSV}>
        <FileDown className="h-4 w-4 mr-1" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportJSON}>
        <Download className="h-4 w-4 mr-1" />
        Backup
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportJSON}>
        <Upload className="h-4 w-4 mr-1" />
        Restore
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

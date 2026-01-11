import { TimetableGrid } from '@/components/TimetableGrid'
import { PeopleManager } from '@/components/PeopleManager'
import { DepartmentManager } from '@/components/DepartmentManager'
import { TimetableManager } from '@/components/TimetableManager'
import { ExportImport } from '@/components/ExportImport'
import { Toolbar } from '@/components/Toolbar'
import { CalendarDays } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Ward Schedule</h1>
                <p className="text-sm text-muted-foreground">Timetable Management</p>
              </div>
            </div>
            <ExportImport />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TimetableManager />
            <DepartmentManager />
            <PeopleManager />
          </div>

          {/* Main Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            <Toolbar />
            <TimetableGrid />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            Click on cells to cycle through shifts: M (Morning) → A (Afternoon) → E (Evening) → X (Off)
          </p>
          <p className="mt-1">
            Rule: Evening (E) shifts require an Off (X) day before. Violations are highlighted with a warning.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

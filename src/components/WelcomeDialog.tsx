import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, RefreshCw, Download, Printer } from 'lucide-react'

const WELCOME_SHOWN_KEY = 'ward-schedule-welcome-shown'

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY)
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onClose={handleClose} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-6 w-6" />
            Welcome to Ward Schedule
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          <p className="text-muted-foreground">
            A simple tool for creating and managing ward schedules. Here's how to get started:
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Add People</p>
                <p className="text-muted-foreground">
                  Use the <Users className="inline h-4 w-4" /> People panel to add staff members. You can assign them to departments and set their weekly off days.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Create a Timetable</p>
                <p className="text-muted-foreground">
                  Click "New" in the Timetables panel to create a schedule with a date range.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Generate Schedule</p>
                <p className="text-muted-foreground">
                  Click <RefreshCw className="inline h-4 w-4" /> Generate Schedule to auto-fill shifts evenly. The system respects weekly off days and the "X before E" rule.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">4</span>
              </div>
              <div>
                <p className="font-medium">Edit & Export</p>
                <p className="text-muted-foreground">
                  Click any cell to cycle shifts (M → A → E → X). Use <Download className="inline h-4 w-4" /> Export or <Printer className="inline h-4 w-4" /> Print to save your schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Shift Types:</p>
            <div className="flex gap-4 text-sm">
              <span><strong>M</strong> = Morning</span>
              <span><strong>A</strong> = Afternoon</span>
              <span><strong>E</strong> = Evening</span>
              <span><strong>X</strong> = Off</span>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Rule: Evening (E) shifts require an Off (X) day before.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Undo2, Redo2, RefreshCw, Palette, Users } from 'lucide-react'

export function Toolbar() {
  const {
    settings,
    toggleColorMode,
    toggleGroupByDepartment,
    generateSchedule,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentTimetable,
    people,
  } = useStore()

  const currentTimetable = getCurrentTimetable()
  const hasData = currentTimetable && people.length > 0

  const handleGenerate = () => {
    if (!hasData) return
    if (currentTimetable.assignments.length > 0) {
      if (!confirm('This will regenerate the entire schedule. Continue?')) {
        return
      }
    }
    generateSchedule()
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border print:hidden">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={!hasData}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Generate Schedule
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.colorMode}
            onCheckedChange={toggleColorMode}
            id="color-mode"
          />
          <Label htmlFor="color-mode" className="flex items-center gap-1 cursor-pointer">
            <Palette className="h-4 w-4" />
            Colors
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={settings.groupByDepartment}
            onCheckedChange={toggleGroupByDepartment}
            id="group-dept"
          />
          <Label htmlFor="group-dept" className="flex items-center gap-1 cursor-pointer">
            <Users className="h-4 w-4" />
            Group by Dept
          </Label>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Calendar, Edit2 } from 'lucide-react'

export function TimetableManager() {
  const {
    timetables,
    currentTimetableId,
    createTimetable,
    setCurrentTimetable,
    deleteTimetable,
    renameTimetable,
  } = useStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const handleOpenCreate = () => {
    setName('')
    const today = new Date()
    setStartDate(format(today, 'yyyy-MM-dd'))
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    setEndDate(format(endOfMonth, 'yyyy-MM-dd'))
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    if (!name.trim() || !startDate || !endDate) return
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date')
      return
    }
    createTimetable(name.trim(), startDate, endDate)
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this timetable?')) {
      deleteTimetable(id)
    }
  }

  const handleOpenRename = (id: string, currentName: string) => {
    setRenamingId(id)
    setNewName(currentName)
    setIsRenameDialogOpen(true)
  }

  const handleRename = () => {
    if (renamingId && newName.trim()) {
      renameTimetable(renamingId, newName.trim())
      setIsRenameDialogOpen(false)
      setRenamingId(null)
    }
  }

  const timetableOptions = timetables.map((t) => ({
    value: t.id,
    label: `${t.name} (${format(parseISO(t.startDate), 'MMM d')} - ${format(parseISO(t.endDate), 'MMM d, yyyy')})`,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timetables
        </CardTitle>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {timetables.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No timetables created yet
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Current Timetable</Label>
              <Select
                value={currentTimetableId || ''}
                onChange={(e) => setCurrentTimetable(e.target.value || null)}
                options={[{ value: '', label: 'Select a timetable...' }, ...timetableOptions]}
              />
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {timetables.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    t.id === currentTimetableId ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <div className="text-sm">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {format(parseISO(t.startDate), 'MMM d')} - {format(parseISO(t.endDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenRename(t.id, t.name)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tt-name">Name</Label>
              <Input
                id="tt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., January 2026 Schedule"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || !startDate || !endDate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent onClose={() => setIsRenameDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Rename Timetable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-name">Name</Label>
              <Input
                id="rename-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Users, Calendar } from 'lucide-react'
import { WEEKDAYS } from '@/types'
import { cn } from '@/lib/utils'

export function PeopleManager() {
  const { people, departments, addPerson, updatePerson, deletePerson } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isOffDaysDialogOpen, setIsOffDaysDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<string | null>(null)
  const [offDaysPersonId, setOffDaysPersonId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  const handleOpenAdd = () => {
    setEditingPerson(null)
    setName('')
    setDepartmentId('')
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    if (person) {
      setEditingPerson(personId)
      setName(person.name)
      setDepartmentId(person.departmentId || '')
      setIsDialogOpen(true)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return

    if (editingPerson) {
      updatePerson(editingPerson, {
        name: name.trim(),
        departmentId: departmentId || undefined,
      })
    } else {
      addPerson({
        name: name.trim(),
        departmentId: departmentId || undefined,
      })
    }

    setIsDialogOpen(false)
    setName('')
    setDepartmentId('')
    setEditingPerson(null)
  }

  const handleDelete = (personId: string) => {
    if (confirm('Are you sure you want to delete this person? This will also remove them from all timetables.')) {
      deletePerson(personId)
    }
  }

  const handleOpenOffDays = (personId: string) => {
    setOffDaysPersonId(personId)
    setIsOffDaysDialogOpen(true)
  }

  const handleToggleWeekday = (weekday: number) => {
    if (!offDaysPersonId) return
    const person = people.find(p => p.id === offDaysPersonId)
    if (!person) return
    
    const currentOffDays = person.offWeekdays || []
    const newOffDays = currentOffDays.includes(weekday)
      ? currentOffDays.filter(d => d !== weekday)
      : [...currentOffDays, weekday].sort((a, b) => a - b)
    
    updatePerson(offDaysPersonId, { offWeekdays: newOffDays })
  }

  const offDaysPerson = offDaysPersonId ? people.find(p => p.id === offDaysPersonId) : null

  const getOffDaysLabel = (offWeekdays?: number[]) => {
    if (!offWeekdays || offWeekdays.length === 0) return null
    return offWeekdays.map(d => WEEKDAYS[d].label).join(', ')
  }

  const departmentOptions = [
    { value: '', label: 'No Department' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          People ({people.length})
        </CardTitle>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No people added yet
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {people
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((person) => {
                const dept = departments.find((d) => d.id === person.departmentId)
                const offDaysLabel = getOffDaysLabel(person.offWeekdays)
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                  >
                    <div>
                      <span className="font-medium">{person.name}</span>
                      {dept && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({dept.name})
                        </span>
                      )}
                      {offDaysLabel && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded ml-2">
                          Off: {offDaysLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenOffDays(person.id)}
                        title="Set off days"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(person.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(person.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingPerson ? 'Edit Person' : 'Add Person'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department (optional)</Label>
              <Select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                options={departmentOptions}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingPerson ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Off Days Dialog */}
      <Dialog open={isOffDaysDialogOpen} onOpenChange={setIsOffDaysDialogOpen}>
        <DialogContent onClose={() => setIsOffDaysDialogOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Weekly Off Days - {offDaysPerson?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select which days of the week this person is always off. The schedule generator will automatically assign X (Off) on these days.
            </p>
            
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = offDaysPerson?.offWeekdays?.includes(day.value)
                return (
                  <button
                    key={day.value}
                    onClick={() => handleToggleWeekday(day.value)}
                    className={cn(
                      'px-4 py-2 rounded-md font-medium transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>

            {offDaysPerson?.offWeekdays && offDaysPerson.offWeekdays.length > 0 && (
              <p className="text-sm text-muted-foreground">
                This person will be off every: {offDaysPerson.offWeekdays.map(d => WEEKDAYS[d].label).join(', ')}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsOffDaysDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

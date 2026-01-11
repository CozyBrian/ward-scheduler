import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Building2 } from 'lucide-react'

export function DepartmentManager() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, people } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null)
  const [name, setName] = useState('')

  const handleOpenAdd = () => {
    setEditingDepartment(null)
    setName('')
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId)
    if (dept) {
      setEditingDepartment(deptId)
      setName(dept.name)
      setIsDialogOpen(true)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return

    if (editingDepartment) {
      updateDepartment(editingDepartment, { name: name.trim() })
    } else {
      addDepartment({ name: name.trim() })
    }

    setIsDialogOpen(false)
    setName('')
    setEditingDepartment(null)
  }

  const handleDelete = (deptId: string) => {
    const peopleInDept = people.filter((p) => p.departmentId === deptId).length
    const message = peopleInDept > 0
      ? `This department has ${peopleInDept} people. They will be moved to "No Department". Continue?`
      : 'Are you sure you want to delete this department?'
    
    if (confirm(message)) {
      deleteDepartment(deptId)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Departments ({departments.length})
        </CardTitle>
        <Button size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No departments added yet
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {departments
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((dept) => {
                const count = people.filter((p) => p.departmentId === dept.id).length
                return (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                  >
                    <div>
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({count} {count === 1 ? 'person' : 'people'})
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(dept.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(dept.id)}
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
            <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter department name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingDepartment ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

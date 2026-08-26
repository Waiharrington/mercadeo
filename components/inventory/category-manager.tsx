"use client"

import * as React from "react"
import { PlusIcon, PencilIcon, Trash2Icon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

interface CategoryManagerProps {
  categories: string[]
  productCounts?: Record<string, number>
  onAdd: (name: string) => void
  onUpdate: (oldName: string, newName: string) => void
  onDelete: (name: string) => void
}

export function CategoryManager({
  categories,
  productCounts = {},
  onAdd,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = React.useState("")
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState("")
  const [deletingCategory, setDeletingCategory] = React.useState<string | null>(null)

  const handleAdd = () => {
    const trimmed = newCategory.trim()
    if (trimmed && !categories.includes(trimmed)) {
      onAdd(trimmed)
      setNewCategory("")
    }
  }

  const handleUpdate = () => {
    if (editingCategory && editValue.trim() && editValue.trim() !== editingCategory) {
      onUpdate(editingCategory, editValue.trim())
      setEditingCategory(null)
      setEditValue("")
    }
  }

  const handleDelete = () => {
    if (deletingCategory) {
      onDelete(deletingCategory)
      setDeletingCategory(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nueva categoria..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!newCategory.trim()}>
          <PlusIcon className="size-3" />
          Agregar
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <TagIcon className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No hay categorias creadas.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between rounded-lg border px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <TagIcon className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{category}</p>
                  <p className="text-xs text-muted-foreground">
                    {productCounts[category] ?? 0} productos
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setEditingCategory(category)
                    setEditValue(category)
                  }}
                >
                  <PencilIcon className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingCategory(category)}
                >
                  <Trash2Icon className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Cambia el nombre de la categoria. Los productos existentes se actualizaran.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="edit-category">Nombre</Label>
            <Input
              id="edit-category"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!editValue.trim() || editValue.trim() === editingCategory}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoria</DialogTitle>
            <DialogDescription>
              Estas seguro que deseas eliminar la categoria &quot;{deletingCategory}&quot;? Los productos no se eliminaran, solo perderan esta categoria.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

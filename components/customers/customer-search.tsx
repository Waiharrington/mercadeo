"use client"

import { useState, useEffect, useRef } from "react"
import { Search, User, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Customer {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  debt_balance?: number
  total_purchases?: number
}

interface CustomerSearchProps {
  customers: Customer[]
  value: string | null
  onSelect: (customerId: string | null) => void
}

export function CustomerSearch({ customers, value, onSelect }: CustomerSearchProps) {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = value ? customers.find((c) => c.id === value) : null

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
          <User className="size-4 text-muted-foreground shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{selected.name}</p>
            {selected.phone && (
              <p className="text-xs text-muted-foreground">{selected.phone}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              setSearch("")
            }}
            className="shrink-0 rounded-md p-1 hover:bg-muted"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
        </div>
      )}

      {isOpen && !selected && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md">
          <div
            className="cursor-pointer border-b px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            onClick={() => {
              onSelect(null)
              setIsOpen(false)
              setSearch("")
            }}
          >
            Cliente general (sin registro)
          </div>
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No se encontraron clientes
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="cursor-pointer px-3 py-2 hover:bg-accent"
                  onClick={() => {
                    onSelect(customer.id)
                    setIsOpen(false)
                    setSearch("")
                  }}
                >
                  <p className="text-sm font-medium">{customer.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {customer.phone && <span>{customer.phone}</span>}
                    {Number(customer.debt_balance || 0) > 0 && (
                      <span className="text-destructive">
                        Deuda: ${Number(customer.debt_balance).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

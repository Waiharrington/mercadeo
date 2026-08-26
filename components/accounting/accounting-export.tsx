"use client"

import { useState } from "react"
import { FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AccountingExportProps {
  reportType: string
  data?: Record<string, string | number>[]
  filename?: string
}

export function AccountingExport({
  reportType,
  data = [],
  filename,
}: AccountingExportProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const baseName = filename || `reporte-${reportType.toLowerCase().replace(/\s+/g, "-")}`

  function generateCSV(data: Record<string, string | number>[]): string {
    if (data.length === 0) return ""
    const headers = Object.keys(data[0])
    const rows = data.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "")}"`).join(",")
    )
    return [headers.join(","), ...rows].join("\n")
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportPDF() {
    setIsExporting("pdf")
    const content = generatePDFContent()
    downloadFile(content, `${baseName}.txt`, "text/plain")
    setTimeout(() => setIsExporting(null), 500)
  }

  function handleExportExcel() {
    setIsExporting("excel")
    const csv = generateCSV(data)
    downloadFile(csv, `${baseName}.csv`, "text/csv")
    setTimeout(() => setIsExporting(null), 500)
  }

  function handleExportCSV() {
    setIsExporting("csv")
    const csv = generateCSV(data)
    downloadFile(csv, `${baseName}.csv`, "text/csv")
    setTimeout(() => setIsExporting(null), 500)
  }

  function generatePDFContent(): string {
    const lines: string[] = []
    lines.push(`REPORTE: ${reportType}`)
    lines.push(`Fecha: ${new Date().toLocaleDateString("es-VE")}`)
    lines.push("=".repeat(50))
    lines.push("")

    if (data.length > 0) {
      const headers = Object.keys(data[0])
      lines.push(headers.join(" | "))
      lines.push("-".repeat(50))
      data.forEach((row) => {
        lines.push(headers.map((h) => row[h] ?? "").join(" | "))
      })
    } else {
      lines.push("Sin datos disponibles.")
    }

    lines.push("")
    lines.push("=".repeat(50))
    lines.push("Generado por Mercadeo SaaS")
    return lines.join("\n")
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExporting === "pdf"}
      >
        {isExporting === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Exportar PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        disabled={isExporting === "excel"}
      >
        {isExporting === "excel" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        Exportar Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={isExporting === "csv"}
      >
        {isExporting === "csv" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileDown className="size-4" />
        )}
        Exportar CSV
      </Button>
    </div>
  )
}

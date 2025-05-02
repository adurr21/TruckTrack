'use client'

import { Button } from '@mui/joy'

interface ExportCSVButtonProps {
    data: any[]
    filename?: string
}

export default function ExportCSVButton({ data, filename = 'data.csv' }: ExportCSVButtonProps) {
    const exportToCSV = () => {
        if (!data || data.length === 0) return

        const excludeFields = ['sheet_id', 'user_id']
        const filteredKeys = Object.keys(data[0]).filter(key => !excludeFields.includes(key))

        const header = filteredKeys.join(',')
        const rows = data.map(row =>
            filteredKeys
                .map(key => `"${String(row[key]).replace(/"/g, '""')}"`)
                .join(',')
        )

        const csv = [header, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <Button sx={{ width: '150px' }}color="success" onClick={exportToCSV}>
            Export to CSV
        </Button>
    )
}

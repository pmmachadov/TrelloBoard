import { useRef } from 'react'
import { Box, Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import { useBoardStore } from '../../store/useBoardStore'
import { boardDataSchema } from '../../model/boardSchema'

function ImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const boards = useBoardStore((state) => state.boards)
  const columns = useBoardStore((state) => state.columns)
  const cards = useBoardStore((state) => state.cards)
  const boardIds = useBoardStore((state) => state.boardIds)
  const loadData = useBoardStore((state) => state.loadData)

  const handleExport = () => {
    const data = { boards, columns, cards, boardIds }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trello-board-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        const validated = boardDataSchema.parse(parsed)
        loadData(validated)
      } catch {
        alert('Invalid board file')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExport}>
        Export
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current?.click()}
      >
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </Box>
  )
}

export default ImportExport

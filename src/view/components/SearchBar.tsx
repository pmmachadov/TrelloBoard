import { useMemo } from 'react'
import { TextField } from '@mui/material'
import Fuse from 'fuse.js'
import { useBoardStore } from '../../store/useBoardStore'

function SearchBar() {
  const searchQuery = useBoardStore((state) => state.searchQuery)
  const setSearchQuery = useBoardStore((state) => state.setSearchQuery)
  const cards = useBoardStore((state) => state.cards)

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null
    const cardList = Object.values(cards)
    const fuse = new Fuse(cardList, {
      keys: ['title', 'description'],
      threshold: 0.4,
    })
    return fuse.search(searchQuery).map((r) => r.item)
  }, [searchQuery, cards])

  return (
    <TextField
      placeholder="Search cards..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      size="small"
      sx={{
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'grey.500',
          },
          '&:hover fieldset': {
            borderColor: 'grey.300',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
          },
        },
      }}
      helperText={results ? `${results.length} results` : ''}
    />
  )
}

export default SearchBar

import { Box, Typography } from '@mui/material'
import { useBoardStore } from '../../store/useBoardStore'

function SaveIndicator() {
  const isSaving = useBoardStore((state) => state.isSaving)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {isSaving ? 'Saving...' : 'Saved'}
      </Typography>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: isSaving ? 'warning.main' : 'success.main',
          transition: 'background-color 0.3s',
        }}
      />
    </Box>
  )
}

export default SaveIndicator

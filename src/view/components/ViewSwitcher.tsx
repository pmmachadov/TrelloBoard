import { Tabs, Tab } from '@mui/material'
import type { ViewMode } from '../../store/useBoardStore'

interface ViewSwitcherProps {
  current: ViewMode
  onChange: (mode: ViewMode) => void
}

function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <Tabs
      value={current}
      onChange={(_, value) => onChange(value as ViewMode)}
      textColor="primary"
      indicatorColor="primary"
    >
      <Tab value="board" label="Board" />
      <Tab value="table" label="Table" />
      <Tab value="calendar" label="Calendar" />
      <Tab value="timeline" label="Timeline" />
    </Tabs>
  )
}

export default ViewSwitcher

import { Routes, Route, Navigate } from 'react-router-dom'
import BoardPage from './view/pages/BoardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/board/default" replace />} />
      <Route path="/board/:boardId" element={<BoardPage />} />
    </Routes>
  )
}

export default App

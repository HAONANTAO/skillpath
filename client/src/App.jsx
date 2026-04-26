import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import RoadmapGenerator from './pages/RoadmapGenerator'
import LearningNode from './pages/LearningNode'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapGenerator /></ProtectedRoute>} />
        <Route path="/learn"   element={<ProtectedRoute><LearningNode /></ProtectedRoute>} />
        <Route path="/quiz"    element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

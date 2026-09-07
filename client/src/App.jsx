import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Voting from './components/Voting'
import Admin from './components/Admin'
import AdminLogin from './components/AdminLogin'
import { useState, useEffect } from 'react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
          <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} />
          <Route path="/admin/login" element={!isAdmin ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/admin" />} />
          <Route path="/dashboard" element={user && !isAdmin ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to={isAdmin ? "/admin" : "/login"} />} />
          <Route path="/voting/:electionId" element={user && !isAdmin ? <Voting user={user} /> : <Navigate to={isAdmin ? "/admin" : "/login"} />} />
          <Route path="/admin" element={isAdmin ? <Admin user={user} onLogout={handleLogout} /> : <Navigate to="/admin/login" />} />
          <Route path="/" element={<Navigate to={isAdmin ? "/admin" : user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

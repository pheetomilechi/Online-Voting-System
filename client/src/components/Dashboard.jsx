import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Vote, User, Calendar, Clock } from 'lucide-react'

const Dashboard = ({ user, onLogout }) => {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchElections()
  }, [])

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/voting/elections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setElections(data.elections)
      }
    } catch (error) {
      console.error('Error fetching elections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (electionId) => {
    navigate(`/voting/${electionId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h1>
                <p className="text-gray-600">Voter ID: {user.voterId}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Admin Panel
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Active Elections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Vote className="w-6 h-6 text-blue-600" />
            Active Elections
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading elections...</p>
            </div>
          ) : elections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Elections</h3>
              <p className="text-gray-500">Check back later for new voting opportunities</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {elections.map((election) => (
                <div
                  key={election.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                    <h3 className="text-xl font-bold text-white">{election.title}</h3>
                    {election.description && (
                      <p className="text-blue-100 mt-2">{election.description}</p>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span>Started: {formatDate(election.startDate)}</span>
                      </div>
                      {election.endDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span>Ends: {formatDate(election.endDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-5 h-5" />
                        <span>{election.candidates.length} Candidates</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVote(election.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
                    >
                      Vote Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

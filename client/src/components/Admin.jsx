import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Power, CheckCircle, XCircle } from 'lucide-react'

const Admin = ({ user }) => {
  const navigate = useNavigate()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    candidates: [{ name: '', description: '' }]
  })

  useEffect(() => {
    fetchElections()
  }, [])

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/elections', {
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

  const handleCreateElection = async (e) => {
    e.preventDefault()

    const validCandidates = newElection.candidates.filter(c => c.name.trim() !== '')
    if (validCandidates.length === 0) {
      alert('Please add at least one candidate')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newElection.title,
          description: newElection.description,
          candidates: validCandidates
        })
      })

      if (response.ok) {
        setShowCreateForm(false)
        setNewElection({
          title: '',
          description: '',
          candidates: [{ name: '', description: '' }]
        })
        fetchElections()
      } else {
        alert('Failed to create election')
      }
    } catch (error) {
      console.error('Error creating election:', error)
      alert('Failed to create election')
    }
  }

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/elections/${electionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchElections()
      } else {
        alert('Failed to delete election')
      }
    } catch (error) {
      console.error('Error deleting election:', error)
      alert('Failed to delete election')
    }
  }

  const handleUpdateStatus = async (electionId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/elections/${electionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchElections()
      } else {
        alert('Failed to update election status')
      }
    } catch (error) {
      console.error('Error updating election status:', error)
      alert('Failed to update election status')
    }
  }

  const addCandidate = () => {
    setNewElection({
      ...newElection,
      candidates: [...newElection.candidates, { name: '', description: '' }]
    })
  }

  const removeCandidate = (index) => {
    const candidates = newElection.candidates.filter((_, i) => i !== index)
    setNewElection({ ...newElection, candidates })
  }

  const updateCandidate = (index, field, value) => {
    const candidates = [...newElection.candidates]
    candidates[index][field] = value
    setNewElection({ ...newElection, candidates })
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Election
          </button>
        </div>

        {/* Create Election Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Election</h2>
            <form onSubmit={handleCreateElection} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Election Title</label>
                <input
                  type="text"
                  required
                  value={newElection.title}
                  onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter election title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newElection.description}
                  onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter election description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Candidates</label>
                {newElection.candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={candidate.name}
                        onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Candidate name"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={candidate.description}
                        onChange={(e) => updateCandidate(index, 'description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Candidate description"
                      />
                    </div>
                    {newElection.candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCandidate}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  + Add Candidate
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
                >
                  Create Election
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Elections List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Elections</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading elections...</p>
            </div>
          ) : elections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500">No elections created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elections.map((election) => (
                <div key={election.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                      {election.description && (
                        <p className="text-gray-600 mt-1">{election.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          election.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {election.status === 'active' ? 'Active' : 'Ended'}
                        </span>
                        <span className="text-gray-600">{election.candidates.length} candidates</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {election.status === 'active' ? (
                        <button
                          onClick={() => handleUpdateStatus(election.id, 'ended')}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        >
                          <Power className="w-4 h-4" />
                          End Election
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(election.id, 'active')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteElection(election.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Candidates</h4>
                    <div className="flex flex-wrap gap-2">
                      {election.candidates.map((candidate) => (
                        <span
                          key={candidate.id}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {candidate.name} ({candidate.voteCount || 0} votes)
                        </span>
                      ))}
                    </div>
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

export default Admin

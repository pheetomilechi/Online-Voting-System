import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

const Voting = ({ user }) => {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [selectedCandidate, setSelectedCandidate,] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchElection()
  }, [electionId])

  const fetchElection = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/voting/elections/${electionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setElection(data.election)
        if (data.election.hasVoted) {
          setSuccess(true)
        }
      } else {
        setError(data.message || 'Failed to load election')
      }
    } catch (error) {
      console.error('Error fetching election:', error)
      setError('Failed to load election')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const token = localStorage.getItem('token')
      const response = await fetch('/api/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          electionId,
          candidateId: selectedCandidate
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.message || 'Failed to submit vote')
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      setError('Failed to submit vote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading election...</p>
        </div>
      </div>
    )
  }

  if (error && !election) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Vote Submitted!</h2>
          <p className="text-gray-600 mb-6">Your vote has been successfully recorded. Thank you for participating.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Election Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">{election.title}</h1>
            {election.description && (
              <p className="text-blue-100">{election.description}</p>
            )}
          </div>

          {/* Candidates */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Candidate</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {election.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCandidate === candidate.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedCandidate === candidate.id && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
                      {candidate.description && (
                        <p className="text-gray-600 mt-1">{candidate.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmitVote}
              disabled={!selectedCandidate || submitting}
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {submitting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Voting

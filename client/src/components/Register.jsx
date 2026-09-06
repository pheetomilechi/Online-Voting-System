import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CameraOff, UserPlus, Check } from 'lucide-react'
import * as faceapi from 'face-api.js'

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    voterId: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [error, setError] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [faceCaptured, setFaceCaptured] = useState(false)
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadModels()
    return () => {
      stopVideo()
    }
  }, [])

  const loadModels = async () => {
    try {
      setIsLoading(true)
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ])
      setIsModelLoaded(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading models:', err)
      setError('Failed to load face recognition models')
      setIsLoading(false)
    }
  }

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Failed to access camera')
    }
  }

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const captureFace = async () => {
    if (!isModelLoaded || !videoRef.current) {
      setError('Please wait for models to load and camera to start')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      // Wait for video to be ready
      if (videoRef.current.readyState !== 4) {
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve
        })
        await videoRef.current.play()
      }

      // Add a small delay to ensure video is fully playing
      await new Promise(resolve => setTimeout(resolve, 500))

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setError('No face detected. Please ensure your face is clearly visible and well-lit.')
        setIsLoading(false)
        return
      }

      setFaceDescriptor(Array.from(detection.descriptor))
      setFaceCaptured(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Face capture error:', err)
      setError('Failed to capture face. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!faceCaptured || !faceDescriptor) {
      setError('Please capture your face first')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('voterId', formData.voterId)
      formDataToSend.append('faceDescriptor', JSON.stringify(faceDescriptor))

      // Capture image from video
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
      canvas.toBlob(async (blob) => {
        formDataToSend.append('faceImage', blob, 'face.jpg')

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          body: formDataToSend
        })

        const data = await response.json()

        if (response.ok) {
          onLogin(data.user, data.token)
          navigate('/dashboard')
        } else {
          setError(data.message || 'Registration failed')
          setIsLoading(false)
        }
      }, 'image/jpeg')
    } catch (err) {
      console.error('Registration error:', err)
      setError('An error occurred during registration')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Register</h1>
          <p className="text-gray-600 mt-2">Create your account with facial recognition</p>
        </div>

        {isLoading && !isModelLoaded && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading face recognition models...</p>
          </div>
        )}

        {isModelLoaded && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voter ID</label>
              <input
                type="text"
                required
                value={formData.voterId}
                onChange={(e) => setFormData({ ...formData, voterId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your voter ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Face Registration</label>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {faceCaptured && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-green-500 text-white rounded-full p-2">
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                {!isStreaming ? (
                  <button
                    type="button"
                    onClick={startVideo}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={captureFace}
                      disabled={faceCaptured}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {faceCaptured ? 'Face Captured' : 'Capture Face'}
                    </button>
                    <button
                      type="button"
                      onClick={stopVideo}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <CameraOff className="w-5 h-5" />
                      Stop Camera
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!faceCaptured || isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

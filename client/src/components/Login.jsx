import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CameraOff, LogIn } from 'lucide-react'
import * as faceapi from 'face-api.js'
import { loadFaceModels } from '../lib/faceModels'

const Login = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [error, setError] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
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
      await loadFaceModels()
      setIsModelLoaded(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Error loading models:', err)
      setError(`Failed to load face recognition models: ${err.message}`)
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

  const handleLogin = async () => {
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

      const faceDescriptor = Array.from(detection.descriptor)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ faceDescriptor: JSON.stringify(faceDescriptor) })
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, data.token)
        navigate('/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Face Login</h1>
          <p className="text-gray-600 mt-2">Authenticate using facial recognition</p>
        </div>

        {isLoading && !isModelLoaded && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading face recognition models...</p>
          </div>
        )}

        {isModelLoaded && (
          <div className="space-y-6">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
                onPlay={() => {
                  if (canvasRef.current && videoRef.current) {
                    const displaySize = {
                      width: videoRef.current.videoWidth,
                      height: videoRef.current.videoHeight
                    }
                    faceapi.matchDimensions(canvasRef.current, displaySize)
                  }
                }}
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0" />
            </div>

            <div className="flex gap-4">
              {!isStreaming ? (
                <button
                  onClick={startVideo}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopVideo}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <CameraOff className="w-5 h-5" />
                  Stop Camera
                </button>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={!isStreaming || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading ? 'Authenticating...' : 'Login with Face'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

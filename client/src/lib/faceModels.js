import * as faceapi from 'face-api.js'

const LOCAL_MODEL_URL = '/models'
const REMOTE_MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'

const loadFrom = (url) =>
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(url),
    faceapi.nets.faceLandmark68Net.loadFromUri(url),
    faceapi.nets.faceRecognitionNet.loadFromUri(url),
    faceapi.nets.faceExpressionNet.loadFromUri(url)
  ])

export const loadFaceModels = async () => {
  try {
    await loadFrom(LOCAL_MODEL_URL)
  } catch (localError) {
    console.warn('Local face models unavailable, falling back to CDN:', localError)
    await loadFrom(REMOTE_MODEL_URL)
  }
}

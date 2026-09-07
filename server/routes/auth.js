const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/faces');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}.jpg`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const getUsers = () => {
  const dataPath = path.join(__dirname, '../data/users.json');
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return [];
};

const saveUsers = (users) => {
  const dataPath = path.join(__dirname, '../data/users.json');
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};

// Register user with face data
router.post('/register', upload.single('faceImage'), (req, res) => {
  try {
    const { name, email, voterId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Face image is required' });
    }

    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email || u.voterId === voterId)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
      voterId,
      faceImagePath: `/uploads/faces/${req.file.filename}`,
      faceDescriptor: req.body.faceDescriptor ? JSON.parse(req.body.faceDescriptor) : null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        voterId: newUser.voterId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: `Server error during registration: ${error.message}` });
  }
});

// Login with face recognition
router.post('/login', (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    if (!faceDescriptor) {
      return res.status(400).json({ message: 'Face descriptor is required' });
    }

    const users = getUsers();
    const descriptor = typeof faceDescriptor === 'string' ? JSON.parse(faceDescriptor) : faceDescriptor;

    // Simple matching - in production, use proper face-api.js matching
    let matchedUser = null;
    let minDistance = Infinity;

    users.forEach(user => {
      if (user.faceDescriptor) {
        const distance = calculateEuclideanDistance(descriptor, user.faceDescriptor);
        if (distance < 0.6 && distance < minDistance) { // Threshold for face match
          minDistance = distance;
          matchedUser = user;
        }
      }
    });

    if (!matchedUser) {
      return res.status(401).json({ message: 'Face not recognized' });
    }

    const token = jwt.sign({ id: matchedUser.id, email: matchedUser.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        voterId: matchedUser.voterId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: `Server error during login: ${error.message}` });
  }
});

// Helper function to calculate Euclidean distance between face descriptors
function calculateEuclideanDistance(desc1, desc2) {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

// Get current user
router.get('/me', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = getUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        voterId: user.voterId
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

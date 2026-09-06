# Secure Voting System with Facial Recognition

A modern online voting system that uses facial recognition for secure authentication. Built with React, Node.js, Express, and face-api.js.

## Features

- **Facial Recognition Authentication**: Secure login and registration using face-api.js
- **User Registration**: Capture and store facial descriptors for authentication
- **Secure Voting**: Cast votes in active elections with one-vote-per-election enforcement
- **Admin Panel**: Create, manage, and control elections
- **Real-time Results**: View election results after voting ends
- **Modern UI**: Beautiful, responsive interface built with TailwindCSS

## Tech Stack

### Frontend
- React 18
- React Router DOM
- face-api.js (facial recognition)
- Axios (API calls)
- TailwindCSS (styling)
- Lucide React (icons)
- Vite (build tool)

### Backend
- Node.js
- Express.js
- JWT (authentication)
- Multer (file uploads)
- CORS (cross-origin requests)

## Project Structure

```
windsurf-project-2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Voting.jsx
│   │   │   └── Admin.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                # Express backend
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── voting.js     # Voting endpoints
│   │   └── admin.js      # Admin endpoints
│   ├── middleware/
│   │   └── auth.js       # JWT authentication middleware
│   ├── data/             # JSON data storage
│   │   ├── users.json
│   │   ├── elections.json
│   │   └── votes.json
│   ├── uploads/          # Uploaded face images
│   └── index.js          # Server entry point
├── .env                  # Environment variables
├── package.json          # Root dependencies
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Or install all at once:**
   ```bash
   npm run install-all
   ```

4. **Configure environment variables:**
   The `.env` file is already configured with default values. For production, update the JWT_SECRET:
   ```
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

## Running the Application

### Development Mode (Both servers)
```bash
npm run dev
```
This will start both the backend server (port 5000) and the frontend dev server (port 3000) concurrently.

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run client
```

### Production Build
```bash
npm run build
```

## Usage

### 1. Register a New User
- Navigate to the registration page
- Fill in your name, email, and voter ID
- Enable camera access
- Capture your face by clicking "Capture Face"
- Submit the registration form

### 2. Login with Face Recognition
- Navigate to the login page
- Enable camera access
- Position your face in the camera frame
- Click "Login with Face" to authenticate

### 3. Vote in Elections
- After logging in, view active elections on the dashboard
- Click "Vote Now" on an election
- Select your preferred candidate
- Submit your vote (one vote per election)

### 4. Admin Panel
- Access the admin panel from the dashboard
- Create new elections with multiple candidates
- Activate or end elections
- Delete elections
- View vote counts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with face data
- `POST /api/auth/login` - Login with face recognition
- `GET /api/auth/me` - Get current user info

### Voting
- `GET /api/voting/elections` - Get all active elections
- `GET /api/voting/elections/:id` - Get specific election details
- `POST /api/voting/vote` - Submit a vote
- `GET /api/voting/results/:id` - Get election results

### Admin
- `POST /api/admin/elections` - Create new election
- `GET /api/admin/elections` - Get all elections
- `PUT /api/admin/elections/:id/status` - Update election status
- `DELETE /api/admin/elections/:id` - Delete election

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Face Recognition**: Biometric authentication using face-api.js
- **One Vote Per Election**: Prevents multiple votes in the same election
- **CORS Protection**: Configured cross-origin resource sharing
- **Environment Variables**: Sensitive data stored in environment variables

## Data Storage

The system uses JSON files for data storage:
- `server/data/users.json` - User accounts and face descriptors
- `server/data/elections.json` - Election data and candidates
- `server/data/votes.json` - Vote records

For production, consider migrating to a proper database (PostgreSQL, MongoDB, etc.).

## Facial Recognition

The system uses face-api.js for facial recognition:
- **TinyFaceDetector**: Lightweight face detection model
- **FaceLandmark68Net**: 68-point facial landmark detection
- **FaceRecognitionNet**: Face descriptor generation for matching
- **Euclidean Distance**: Used to compare face descriptors (threshold: 0.6)

## Browser Requirements

- Modern browser with camera support
- JavaScript enabled
- HTTPS required for camera access in production (localhost works in development)

## Troubleshooting

### Camera not working
- Ensure you've granted camera permissions
- Check if another application is using the camera
- Try using a different browser

### Face models not loading
- Check your internet connection (models are loaded from CDN)
- Clear browser cache and reload

### Server connection errors
- Ensure the backend server is running on port 5000
- Check that CORS is properly configured
- Verify API endpoints in the code

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Two-factor authentication
- [ ] Email verification
- [ ] Real-time results with WebSocket
- [ ] Mobile app version
- [ ] Advanced anti-spoofing measures
- [ ] Audit logging
- [ ] Multi-language support

## License

This project is for educational purposes. Use responsibly and comply with local voting regulations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the repository.

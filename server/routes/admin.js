const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const requireAdmin = require('../middleware/requireAdmin');
const { getAdmins } = require('../lib/admins');

const getElections = () => {
  const dataPath = path.join(__dirname, '../data/elections.json');
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return [];
};

const saveElections = (elections) => {
  const dataPath = path.join(__dirname, '../data/elections.json');
  fs.writeFileSync(dataPath, JSON.stringify(elections, null, 2));
};

const readJson = (file) => {
  const dataPath = path.join(__dirname, `../data/${file}`);
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return [];
};

// Administrator login with email and password
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = getAdmins().find(a => a.email === email);

    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: `Server error during admin login: ${error.message}` });
  }
});

// Vote analytics across every election
router.get('/analytics', requireAdmin, (req, res) => {
  try {
    const elections = getElections();
    const votes = readJson('votes.json');
    const registeredVoters = readJson('users.json').length;

    const perElection = elections.map(election => {
      const electionVotes = votes.filter(v => v.electionId === election.id);
      const candidates = election.candidates.map(c => ({
        id: c.id,
        name: c.name,
        voteCount: c.voteCount || 0
      }));
      const leader = candidates.reduce(
        (best, c) => (best && best.voteCount >= c.voteCount ? best : c),
        null
      );

      return {
        id: election.id,
        title: election.title,
        status: election.status,
        totalVotes: electionVotes.length,
        turnout: registeredVoters > 0 ? electionVotes.length / registeredVoters : 0,
        leader: electionVotes.length > 0 ? leader : null,
        candidates
      };
    });

    res.json({
      totals: {
        registeredVoters,
        elections: elections.length,
        activeElections: elections.filter(e => e.status === 'active').length,
        votesCast: votes.length
      },
      elections: perElection
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: `Server error loading analytics: ${error.message}` });
  }
});

// Create a new election
router.post('/elections', requireAdmin, (req, res) => {
  try {
    const { title, description, candidates, endDate } = req.body;

    if (!title || !candidates || candidates.length === 0) {
      return res.status(400).json({ message: 'Title and candidates are required' });
    }

    const elections = getElections();
    
    const newElection = {
      id: uuidv4(),
      title,
      description: description || '',
      candidates: candidates.map(c => ({
        id: uuidv4(),
        name: c.name,
        description: c.description || '',
        voteCount: 0
      })),
      startDate: new Date().toISOString(),
      endDate: endDate || null,
      status: 'active',
      createdBy: req.user.id
    };

    elections.push(newElection);
    saveElections(elections);

    res.status(201).json({ message: 'Election created successfully', election: newElection });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update election status
router.put('/elections/:id/status', requireAdmin, (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const elections = getElections();
    const electionIndex = elections.findIndex(e => e.id === req.params.id);

    if (electionIndex === -1) {
      return res.status(404).json({ message: 'Election not found' });
    }

    elections[electionIndex].status = status;
    saveElections(elections);

    res.json({ message: 'Election status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all elections (including inactive)
router.get('/elections', requireAdmin, (req, res) => {
  try {
    const elections = getElections();
    res.json({ elections });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an election
router.delete('/elections/:id', requireAdmin, (req, res) => {
  try {
    let elections = getElections();
    const initialLength = elections.length;
    elections = elections.filter(e => e.id !== req.params.id);

    if (elections.length === initialLength) {
      return res.status(404).json({ message: 'Election not found' });
    }

    saveElections(elections);
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

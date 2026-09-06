const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');

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

const getVotes = () => {
  const dataPath = path.join(__dirname, '../data/votes.json');
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return [];
};

const saveVotes = (votes) => {
  const dataPath = path.join(__dirname, '../data/votes.json');
  fs.writeFileSync(dataPath, JSON.stringify(votes, null, 2));
};

// Get all active elections
router.get('/elections', auth, (req, res) => {
  try {
    const elections = getElections().filter(e => e.status === 'active');
    res.json({ elections });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific election details
router.get('/elections/:id', auth, (req, res) => {
  try {
    const elections = getElections();
    const election = elections.find(e => e.id === req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if user has already voted
    const votes = getVotes();
    const hasVoted = votes.some(v => v.electionId === req.params.id && v.userId === req.user.id);

    res.json({ 
      election: {
        ...election,
        hasVoted
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a vote
router.post('/vote', auth, (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    if (!electionId || !candidateId) {
      return res.status(400).json({ message: 'Election ID and Candidate ID are required' });
    }

    const elections = getElections();
    const election = elections.find(e => e.id === electionId);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if user has already voted
    const votes = getVotes();
    const existingVote = votes.find(v => v.electionId === electionId && v.userId === req.user.id);

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Record the vote
    const newVote = {
      id: uuidv4(),
      electionId,
      candidateId,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    };

    votes.push(newVote);
    saveVotes(votes);

    // Update election vote count
    const candidateIndex = election.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex !== -1) {
      election.candidates[candidateIndex].voteCount = (election.candidates[candidateIndex].voteCount || 0) + 1;
      saveElections(elections);
    }

    res.json({ message: 'Vote submitted successfully' });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election results (only after election ends)
router.get('/results/:id', auth, (req, res) => {
  try {
    const elections = getElections();
    const election = elections.find(e => e.id === req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status === 'active') {
      return res.status(400).json({ message: 'Election is still active' });
    }

    res.json({ 
      results: election.candidates.map(c => ({
        name: c.name,
        voteCount: c.voteCount || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

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

// Create a new election
router.post('/elections', auth, (req, res) => {
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
router.put('/elections/:id/status', auth, (req, res) => {
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
router.get('/elections', auth, (req, res) => {
  try {
    const elections = getElections();
    res.json({ elections });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an election
router.delete('/elections/:id', auth, (req, res) => {
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

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/admins.json');

const getAdmins = () => {
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return [];
};

const saveAdmins = (admins) => {
  fs.writeFileSync(dataPath, JSON.stringify(admins, null, 2));
};

// Creates the admin declared by ADMIN_EMAIL/ADMIN_PASSWORD, and keeps its
// password in sync when those values change.
const seedAdmin = () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const admins = getAdmins();
  const existing = admins.find(a => a.email === email);
  const passwordHash = bcrypt.hashSync(password, 10);

  if (existing) {
    if (!bcrypt.compareSync(password, existing.passwordHash)) {
      existing.passwordHash = passwordHash;
      saveAdmins(admins);
    }
    return existing;
  }

  const admin = {
    id: uuidv4(),
    name: process.env.ADMIN_NAME || 'Administrator',
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  admins.push(admin);
  saveAdmins(admins);
  return admin;
};

module.exports = { getAdmins, seedAdmin };

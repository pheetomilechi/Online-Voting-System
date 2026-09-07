const auth = require('./auth');

const requireVoter = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot vote' });
    }
    next();
  });
};

module.exports = requireVoter;

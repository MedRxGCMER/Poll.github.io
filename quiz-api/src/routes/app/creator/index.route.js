const express = require('express');
const pollRoutes = require('./poll.route.js');
const authRoutes = require('./auth.route.js');
const passport = require("passport");
const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);  

/** GET /auth - auth service */
router.use('/auth', authRoutes);

/** /polls - for polls related routes */
router.use('/polls', passport.authenticate("jwt", { session: false }),   pollRoutes);

module.exports = router;
const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const router = express.Router();

// ---- replace these with your actual GitHub App credentials ----
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET';
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback';

// ---- configure passport ----
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  // Here you would find or create your User in MongoDB
  console.log('✅ GitHub Profile:', profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// ---- express-session required for passport ----
router.use(require('express-session')({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

// ---- routes ----

// 1. Redirect to GitHub
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

// 2. GitHub callback
router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/login'
}), (req, res) => {
  // Successful login
  res.json({
    message: 'GitHub Login Successful!',
    user: req.user
  });
});

module.exports = router;

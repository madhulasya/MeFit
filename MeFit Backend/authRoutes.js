const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// You can add rate limiting specifically to the login route
// const loginLimiter = ...

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
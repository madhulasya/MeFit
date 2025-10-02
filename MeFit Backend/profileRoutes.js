const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  createOrUpdateProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMyProfile)
  .post(protect, createOrUpdateProfile);

module.exports = router;
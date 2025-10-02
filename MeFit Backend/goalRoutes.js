const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  getGoal,
  updateGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .get(protect, getGoal)
  .patch(protect, updateGoal);

module.exports = router;
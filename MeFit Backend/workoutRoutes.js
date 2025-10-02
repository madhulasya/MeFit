const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  createWorkout,
  getWorkout,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workoutController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getWorkouts)
  .post(protect, authorize('Contributor', 'Admin'), createWorkout);

router
  .route('/:id')
  .get(protect, getWorkout)
  .patch(protect, authorize('Contributor', 'Admin'), updateWorkout)
  .delete(protect, authorize('Contributor', 'Admin'), deleteWorkout);

module.exports = router;
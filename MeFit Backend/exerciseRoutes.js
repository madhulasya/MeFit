const express = require('express');
const router = express.Router();
const {
  getExercises,
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getExercises)
  .post(protect, authorize('Contributor', 'Admin'), createExercise);

router
  .route('/:id')
  .get(protect, getExercise)
  .patch(protect, authorize('Contributor', 'Admin'), updateExercise)
  .delete(protect, authorize('Contributor', 'Admin'), deleteExercise);

module.exports = router;
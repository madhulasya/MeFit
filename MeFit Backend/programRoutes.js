const express = require('express');
const router = express.Router();
const {
  getPrograms,
  createProgram,
  getProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/programController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getPrograms)
  .post(protect, authorize('Contributor', 'Admin'), createProgram);

router
  .route('/:id')
  .get(protect, getProgram)
  .patch(protect, authorize('Contributor', 'Admin'), updateProgram)
  .delete(protect, authorize('Contributor', 'Admin'), deleteProgram);

module.exports = router;
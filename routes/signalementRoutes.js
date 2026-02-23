const express = require('express');
const router = express.Router();
const signalementController = require('../controllers/signalementController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, signalementController.getAllSignalements);
router.get('/:id', protect, signalementController.getSignalementById);
router.post('/', protect, signalementController.createSignalement);
router.put('/:id', protect, signalementController.updateSignalement);
router.delete('/:id', protect, signalementController.deleteSignalement);

module.exports = router;

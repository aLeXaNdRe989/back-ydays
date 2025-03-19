const express = require('express');
const router = express.Router();
const signalementController = require('../controllers/signalementController');

router.post('/', signalementController.createSignalement);
router.get('/', signalementController.getAllSignalements);
router.get('/:id', signalementController.getSignalementById);
router.put('/:id', signalementController.updateSignalement);
router.delete('/:id', signalementController.deleteSignalement);

module.exports = router;

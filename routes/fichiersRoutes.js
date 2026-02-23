const express = require('express');
const router = express.Router();
const fichiersController = require('../controllers/fichiersController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', fichiersController.getAllFichiers);
router.get('/:id', fichiersController.getFichierById);
router.post('/', protect, fichiersController.createFichier);
router.put('/:id', protect, fichiersController.updateFichier);
router.delete('/:id', protect, fichiersController.deleteFichier);

module.exports = router;

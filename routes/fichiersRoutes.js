const express = require('express');
const router = express.Router();
const fichiersController = require('../controllers/fichiersController');

router.post('/', fichiersController.createFichier);
router.get('/', fichiersController.getAllFichiers);
router.get('/:id', fichiersController.getFichierById);
router.put('/:id', fichiersController.updateFichier);
router.delete('/:id', fichiersController.deleteFichier);

module.exports = router;

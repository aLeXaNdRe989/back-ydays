const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');

// ➡️ CRUD Entreprise
router.post('/', entrepriseController.createEntreprise);
router.get('/', entrepriseController.getAllEntreprises);
router.get('/:id', entrepriseController.getEntrepriseById);
router.put('/:id', entrepriseController.updateEntreprise);
router.delete('/:id', entrepriseController.deleteEntreprise);

module.exports = router;

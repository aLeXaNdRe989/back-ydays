const express = require('express');
const router = express.Router();
const partenaireController = require('../controllers/partenaireController');

router.post('/', partenaireController.createPartenaire);
router.get('/', partenaireController.getAllPartenaires);
router.get('/:id', partenaireController.getPartenaireById);
router.put('/:id', partenaireController.updatePartenaire);
router.delete('/:id', partenaireController.deletePartenaire);

module.exports = router;

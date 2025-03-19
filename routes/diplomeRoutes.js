const express = require('express');
const router = express.Router();
const diplomeController = require('../controllers/diplomeController');

router.post('/', diplomeController.createDiplome);
router.get('/', diplomeController.getAllDiplomes);
router.get('/:id', diplomeController.getDiplomeById);
router.put('/:id', diplomeController.updateDiplome);
router.delete('/:id', diplomeController.deleteDiplome);

module.exports = router;

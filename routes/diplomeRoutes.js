const express = require('express');
const router = express.Router();
const diplomeController = require('../controllers/diplomeController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', diplomeController.getAllDiplomes);
router.get('/:id', diplomeController.getDiplomeById);
router.post('/', protect, diplomeController.createDiplome);
router.put('/:id', protect, diplomeController.updateDiplome);
router.delete('/:id', protect, diplomeController.deleteDiplome);

module.exports = router;

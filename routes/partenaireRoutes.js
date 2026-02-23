const express = require('express');
const router = express.Router();
const partenaireController = require('../controllers/partenaireController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', partenaireController.getAllPartenaires);
router.get('/:id', partenaireController.getPartenaireById);
router.post('/', protect, partenaireController.createPartenaire);
router.put('/:id', protect, partenaireController.updatePartenaire);
router.delete('/:id', protect, partenaireController.deletePartenaire);

module.exports = router;

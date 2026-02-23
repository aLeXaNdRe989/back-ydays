const express = require('express');
const router = express.Router();
const ecoleController = require('../controllers/ecoleController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', ecoleController.getAllEcoles);
router.get('/:id', ecoleController.getEcoleById);
router.post('/', protect, ecoleController.createEcole);
router.put('/:id', protect, ecoleController.updateEcole);
router.delete('/:id', protect, ecoleController.deleteEcole);

module.exports = router;

const express = require('express');
const router = express.Router();
const reponseController = require('../controllers/reponseSignalementController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, reponseController.getAllReponsesSignalement);
router.get('/:id', protect, reponseController.getReponseSignalementById);
router.post('/', protect, reponseController.createReponseSignalement);
router.put('/:id', protect, reponseController.updateReponseSignalement);
router.delete('/:id', protect, reponseController.deleteReponseSignalement);

module.exports = router;

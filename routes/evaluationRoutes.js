const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', evaluationController.getAllEvaluations);
router.get('/:id', evaluationController.getEvaluationById);
router.post('/', protect, evaluationController.createEvaluation);
router.put('/:id', protect, evaluationController.updateEvaluation);
router.delete('/:id', protect, evaluationController.deleteEvaluation);

module.exports = router;

const express = require('express');
const router = express.Router();
const reponseController = require('../controllers/reponseSignalementController');

router.post('/', reponseController.createReponseSignalement);
router.get('/', reponseController.getAllReponsesSignalement);
router.get('/:id', reponseController.getReponseSignalementById);
router.put('/:id', reponseController.updateReponseSignalement);
router.delete('/:id', reponseController.deleteReponseSignalement);

module.exports = router;

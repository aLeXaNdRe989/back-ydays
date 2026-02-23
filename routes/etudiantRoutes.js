const express = require('express');
const router = express.Router();
const etudiantController = require('../controllers/etudiantController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', etudiantController.getAllEtudiants);
router.get('/:id', etudiantController.getEtudiantById);
router.post('/', protect, etudiantController.createEtudiant);
router.put('/:id', protect, etudiantController.updateEtudiant);
router.delete('/:id', protect, etudiantController.deleteEtudiant);

module.exports = router;

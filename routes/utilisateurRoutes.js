const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', utilisateurController.getAllUtilisateurs);
router.get('/:id', utilisateurController.getUtilisateurById);
router.post('/', protect, utilisateurController.createUtilisateur);
router.put('/:id', protect, utilisateurController.updateUtilisateur);
router.delete('/:id', protect, utilisateurController.deleteUtilisateur);

module.exports = router;

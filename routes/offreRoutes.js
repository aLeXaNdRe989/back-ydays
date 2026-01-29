const express = require('express');
const router = express.Router();
const offreController = require('../controllers/offreController');
const { protect } = require('../middlewares/authMiddleware');

// Routes protegees - doivent etre AVANT /:id pour eviter conflit
router.get('/mes-offres', protect, offreController.getMesOffres);
router.get('/mes-candidatures', protect, offreController.getMesCandidatures);

// Routes publiques
router.get('/', offreController.getAllOffres);
router.get('/:id', offreController.getOffreById);

// Routes protegees (necessitent authentification)
router.post('/', protect, offreController.createOffre);
router.put('/:id', protect, offreController.updateOffre);
router.delete('/:id', protect, offreController.deleteOffre);

// Candidature
router.post('/:id/candidater', protect, offreController.candidater);
router.get('/:id/candidatures', protect, offreController.getCandidaturesOffre);

module.exports = router;

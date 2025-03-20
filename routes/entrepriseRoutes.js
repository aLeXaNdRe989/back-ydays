const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');
const {protect} = require("../middlewares/authMiddleware");
const {restrictTo, restrictToOwnerOrAdmin} = require("../middlewares/roleMiddleware");
const {getAllEntreprises} = require("../controllers/entrepriseController");

router.get('/', protect, entrepriseController.getAllEntreprises);
router.get('/:id', protect,entrepriseController.getEntrepriseById);

// Création réservée à admin et entreprise
router.post(
    '/',
    protect,
    restrictTo('admin', 'entreprise'),
    entrepriseController.createEntreprise
);

//Mise à jour réservée aux admins ou au propriétaires
router.put(
    '/:id',
    protect, // Vérifie le JWT
    restrictToOwnerOrAdmin, // Vérifie admin ou propriétaire
    entrepriseController.updateEntreprise
);

// Suppression réservée aux admins
router.delete(
    '/:id',
    protect,
    restrictTo('admin'),
    entrepriseController.deleteEntreprise
);

module.exports = router;

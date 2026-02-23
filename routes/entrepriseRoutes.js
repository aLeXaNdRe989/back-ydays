const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo, restrictToOwnerOrAdmin } = require("../middlewares/roleMiddleware");

// ➡️ Récupérer toutes les entreprises
router.get('/', protect, entrepriseController.getAllEntreprises);

// ➡️ Récupérer une entreprise par ID
router.get('/:id', protect, entrepriseController.getEntrepriseById);

// ➡️ Récupérer le profil entreprise du user connecté
//    (pour permettre à l'entreprise de charger / éditer son propre profil)
router.get(
    '/me/profile',
    protect,
    restrictTo('admin', 'entreprise'),
    entrepriseController.getMyEntreprise
);

// ➡️ Création réservée à admin et entreprise
router.post(
    '/',
    protect,
    restrictTo('admin', 'entreprise'),
    entrepriseController.createEntreprise
);

// ➡️ Mise à jour réservée aux admins ou au propriétaire de l'entreprise
router.put(
    '/:id',
    protect, // Vérifie le JWT
    restrictToOwnerOrAdmin, // Vérifie admin ou propriétaire (basé sur createdBy)
    entrepriseController.updateEntreprise
);

// ➡️ Suppression réservée aux admins
router.delete(
    '/:id',
    protect,
    restrictTo('admin'),
    entrepriseController.deleteEntreprise
);

module.exports = router;
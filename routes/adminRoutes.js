const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');

// Toutes les routes admin nécessitent d'être authentifié et d'avoir le rôle admin
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getAllUsersAdmin);
router.patch('/users/:id/approval', adminController.updateUserApproval);
router.delete('/users/:id', adminController.deleteUserAdmin);

// Entreprises management
router.get('/entreprises', adminController.getAllEntreprisesAdmin);
router.patch('/entreprises/:id/approval', adminController.updateEntrepriseApproval);
router.delete('/entreprises/:id', adminController.deleteEntrepriseAdmin);

// Offres management
router.get('/offres', adminController.getAllOffresAdmin);
router.delete('/offres/:id', adminController.deleteOffreAdmin);

module.exports = router;

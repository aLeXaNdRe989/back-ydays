const express = require('express');
const router = express.Router();
const { registerutilisateur, loginutilisateur, registerEntreprise } = require('../controllers/authController');
const {protect} = require('../middlewares/authMiddleware');
const Utilisateur = require('../models/utilisateur');

router.post('/register', registerutilisateur);
router.post('/register-entreprise', registerEntreprise);
router.post('/login', loginutilisateur);

router.get('/me', protect, async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.user.id).select('-password');
        if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });
        res.json(utilisateur);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;
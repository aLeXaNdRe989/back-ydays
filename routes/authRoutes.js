const express = require('express');
const router = express.Router();
const { registerutilisateur, loginutilisateur } = require('../controllers/authController');

router.post('/register', registerutilisateur);
router.post('/login', loginutilisateur);

module.exports = router;

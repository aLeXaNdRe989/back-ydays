const utilisateur = require('../models/utilisateur');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerutilisateur = async (req, res) => {
    const { email, password, role, nom, prenom, entreprise } = req.body;

    try {
        const utilisateurExists = await utilisateur.findOne({ email });
        if (utilisateurExists) return res.status(400).json({ msg: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newutilisateur = new utilisateur({
            email,
            password: hashedPassword,
            role,
            nom,
            prenom,
            entreprise
        });

        await newutilisateur.save();
        res.status(201).json({ msg: 'Utilisateur créé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.loginutilisateur = async (req, res) => {
    const { email, password } = req.body;

    try {
        const utilisateur = await utilisateur.findOne({ email });
        if (!utilisateur) return res.status(400).json({ msg: 'Utilisateur introuvable' });

        const isMatch = await bcrypt.compare(password, utilisateur.password);
        if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

        const token = jwt.sign({ id: utilisateur._id, role: utilisateur.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, utilisateur });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

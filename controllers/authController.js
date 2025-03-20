const Utilisateur = require('../models/utilisateur');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerutilisateur = async (req, res) => {
    const { email, password, role, nom, prenom, entreprise } = req.body;

    try {
        const utilisateurExists = await Utilisateur.findOne({ email });
        if (utilisateurExists) return res.status(400).json({ msg: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUtilisateur = new Utilisateur({
            email,
            password: hashedPassword,
            role,
            nom,
            prenom,
            entreprise
        });

        await newUtilisateur.save();
        res.status(201).json({ msg: 'Utilisateur créé', utilisateur: newUtilisateur });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginutilisateur = async (req, res) => {
    const { email, password } = req.body;

    try {
        const foundUser = await Utilisateur.findOne({ email });
        if (!foundUser) return res.status(400).json({ msg: 'Utilisateur introuvable' });

        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

        const token = jwt.sign(
            { id: foundUser._id, role: foundUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, utilisateur: foundUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

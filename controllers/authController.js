const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');
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

        res.json({
            token,
            utilisateur: {
                _id: foundUser._id,
                nom: foundUser.nom,
                prenom: foundUser.prenom,
                email: foundUser.email,
                role: foundUser.role,
                isApproved: foundUser.isApproved,
                rejectionReason: foundUser.rejectionReason
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.registerEntreprise = async (req, res) => {
    const { nom, prenom, email, password, telephone, entrepriseNom, entrepriseDescription, entrepriseAdresse, entrepriseEmail } = req.body;

    try {
        // Vérifier si l'email utilisateur existe déjà
        const utilisateurExists = await Utilisateur.findOne({ email });
        if (utilisateurExists) return res.status(400).json({ msg: 'Email déjà utilisé' });

        // Vérifier si l'email entreprise existe déjà
        const entrepriseExists = await Entreprise.findOne({ email: entrepriseEmail });
        if (entrepriseExists) return res.status(400).json({ msg: 'Email entreprise déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur avec le rôle entreprise et statut pending
        const newUtilisateur = new Utilisateur({
            nom,
            prenom,
            email,
            password: hashedPassword,
            telephone,
            role: 'entreprise',
            isApproved: 'pending'
        });

        await newUtilisateur.save();

        // Créer le profil entreprise associé
        const newEntreprise = new Entreprise({
            nom: entrepriseNom,
            description: entrepriseDescription,
            adresse: entrepriseAdresse,
            email: entrepriseEmail,
            createdBy: newUtilisateur._id,
            isApproved: 'pending'
        });

        await newEntreprise.save();

        res.status(201).json({
            msg: 'Inscription entreprise enregistrée. En attente de validation par un administrateur.',
            utilisateur: {
                _id: newUtilisateur._id,
                nom: newUtilisateur.nom,
                prenom: newUtilisateur.prenom,
                email: newUtilisateur.email,
                role: newUtilisateur.role,
                isApproved: newUtilisateur.isApproved
            },
            entreprise: {
                _id: newEntreprise._id,
                nom: newEntreprise.nom,
                isApproved: newEntreprise.isApproved
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

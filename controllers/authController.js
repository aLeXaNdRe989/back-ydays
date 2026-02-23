const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const RESET_TOKEN_TTL = 30 * 60 * 1000; // 30 minutes

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
        // Timing attack prevention: always run bcrypt.compare even if user not found
        const dummyHash = '$2b$10$dummyHashForTimingAttackPrevention000000000000000000';
        const isMatch = await bcrypt.compare(password, foundUser ? foundUser.password : dummyHash);
        if (!foundUser || !isMatch) return res.status(400).json({ msg: 'Identifiants incorrects' });

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

// Demander un lien de reinitialisation de mot de passe
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) return res.status(400).json({ msg: 'Email requis' });

        const user = await Utilisateur.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'Aucun compte associé à cet email' });

        // Generer un token unique
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Sauvegarder le token avec TTL (arbitrage : duree ajustee a 30 min)
        user.resetToken = resetToken;
        user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL);
        user.resetTokenUsed = false;
        await user.save();

        // En production on enverrait un email avec le lien
        // Pour la demo on retourne le token directement
        res.json({
            msg: 'Lien de réinitialisation généré',
            resetToken,
            expiresIn: '30 minutes'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Reinitialiser le mot de passe avec le token
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ msg: 'Token et nouveau mot de passe requis' });
        }

        if (newPassword.length < 10) {
            return res.status(400).json({ msg: 'Le mot de passe doit contenir au moins 10 caractères' });
        }

        const user = await Utilisateur.findOne({ resetToken: token });

        if (!user) {
            return res.status(400).json({ msg: 'Token invalide' });
        }

        // Arbitrage B : verifier si le token a deja ete utilise (invalidation apres 1er usage)
        if (user.resetTokenUsed) {
            return res.status(400).json({ msg: 'Ce lien a déjà été utilisé' });
        }

        // Verifier si le token n'est pas expire (TTL ajuste)
        if (user.resetTokenExpires < new Date()) {
            return res.status(400).json({ msg: 'Ce lien a expiré' });
        }

        // Mettre a jour le mot de passe
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetTokenUsed = true; // Marquer comme consomme
        await user.save();

        res.json({ msg: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

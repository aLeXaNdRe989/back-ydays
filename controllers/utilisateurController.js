const Utilisateur = require('../models/utilisateur');
require('../models/photo');

exports.createUtilisateur = async (req, res) => {
    try {
        const utilisateur = new Utilisateur(req.body);
        const savedUtilisateur = await utilisateur.save();
        res.status(201).json(savedUtilisateur);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllUtilisateurs = async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find().populate('logo');
        res.status(200).json(utilisateurs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getUtilisateurById = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id).populate('logo');
        if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json(utilisateur);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateUtilisateur = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json(utilisateur);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUtilisateur = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
        if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

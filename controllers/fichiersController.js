const Fichiers = require('../models/fichiers');

exports.createFichier = async (req, res) => {
    try {
        const fichier = new Fichiers(req.body);
        const savedFichier = await fichier.save();
        res.status(201).json(savedFichier);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllFichiers = async (req, res) => {
    try {
        const fichiers = await Fichiers.find().populate('etudiant');
        res.status(200).json(fichiers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getFichierById = async (req, res) => {
    try {
        const fichier = await Fichiers.findById(req.params.id).populate('etudiant');
        if (!fichier) return res.status(404).json({ message: 'Fichier non trouvé' });
        res.status(200).json(fichier);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateFichier = async (req, res) => {
    try {
        const { libelle, fichier: fichierUrl } = req.body;
        const fichier = await Fichiers.findByIdAndUpdate(req.params.id, { libelle, fichier: fichierUrl }, { new: true });
        if (!fichier) return res.status(404).json({ message: 'Fichier non trouvé' });
        res.status(200).json(fichier);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteFichier = async (req, res) => {
    try {
        const fichier = await Fichiers.findByIdAndDelete(req.params.id);
        if (!fichier) return res.status(404).json({ message: 'Fichier non trouvé' });
        res.status(200).json({ message: 'Fichier supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

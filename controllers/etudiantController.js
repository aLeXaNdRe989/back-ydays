const Etudiant = require('../models/etudiant');

exports.createEtudiant = async (req, res) => {
    try {
        const etudiant = new Etudiant(req.body);
        const savedEtudiant = await etudiant.save();
        res.status(201).json(savedEtudiant);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllEtudiants = async (req, res) => {
    try {
        const etudiants = await Etudiant.find().populate('utilisateur ecole entreprise');
        res.status(200).json(etudiants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getEtudiantById = async (req, res) => {
    try {
        const etudiant = await Etudiant.findById(req.params.id).populate('utilisateur ecole entreprise');
        if (!etudiant) return res.status(404).json({ message: 'Etudiant non trouvé' });
        res.status(200).json(etudiant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateEtudiant = async (req, res) => {
    try {
        const { dateDebut, dateDiplome, dateEmbauche } = req.body;
        const etudiant = await Etudiant.findByIdAndUpdate(req.params.id, { dateDebut, dateDiplome, dateEmbauche }, { new: true });
        if (!etudiant) return res.status(404).json({ message: 'Etudiant non trouvé' });
        res.status(200).json(etudiant);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEtudiant = async (req, res) => {
    try {
        const etudiant = await Etudiant.findByIdAndDelete(req.params.id);
        if (!etudiant) return res.status(404).json({ message: 'Etudiant non trouvé' });
        res.status(200).json({ message: 'Etudiant supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

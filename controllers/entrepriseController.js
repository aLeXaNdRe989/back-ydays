const Entreprise = require('../models/entreprise');

// ➡️ Créer une entreprise
exports.createEntreprise = async (req, res) => {
    try {
        const entreprise = new Entreprise(req.body);
        const savedEntreprise = await entreprise.save();
        res.status(201).json(savedEntreprise);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ➡️ Récupérer toutes les entreprises
exports.getAllEntreprises = async (req, res) => {
    try {
        const entreprises = await Entreprise.find().populate('images');
        res.status(200).json(entreprises);
    } catch (err) {
        console.error('Erreur dans getAllEntreprises:', err);
        res.status(500).json({ error: err.message });
    }
};

// ➡️ Récupérer une entreprise par ID
exports.getEntrepriseById = async (req, res) => {
    try {
        const entreprise = await Entreprise.findById(req.params.id).populate('images');
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        res.status(200).json(entreprise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ➡️ Mettre à jour une entreprise
exports.updateEntreprise = async (req, res) => {
    try {
        const entreprise = await Entreprise.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        res.status(200).json(entreprise);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ➡️ Supprimer une entreprise
exports.deleteEntreprise = async (req, res) => {
    try {
        const entreprise = await Entreprise.findByIdAndDelete(req.params.id);
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        res.status(200).json({ message: 'Entreprise supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

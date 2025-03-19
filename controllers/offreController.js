const Offre = require('../models/offre');
require('../models/photo');

exports.createOffre = async (req, res) => {
    try {
        const offre = new Offre(req.body);
        const savedOffre = await offre.save();
        res.status(201).json(savedOffre);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllOffres = async (req, res) => {
    try {
        const offres = await Offre.find().populate('entreprise diplome ecole images');
        res.status(200).json(offres);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getOffreById = async (req, res) => {
    try {
        const offre = await Offre.findById(req.params.id).populate('entreprise diplome ecole images');
        if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
        res.status(200).json(offre);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateOffre = async (req, res) => {
    try {
        const offre = await Offre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
        res.status(200).json(offre);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteOffre = async (req, res) => {
    try {
        const offre = await Offre.findByIdAndDelete(req.params.id);
        if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
        res.status(200).json({ message: 'Offre supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const Signalement = require('../models/signalement');
require('../models/etudiant');
require('../models/ecole');
require('../models/entreprise');

exports.createSignalement = async (req, res) => {
    try {
        const signalement = new Signalement(req.body);
        const savedSignalement = await signalement.save();
        res.status(201).json(savedSignalement);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllSignalements = async (req, res) => {
    try {
        const signalements = await Signalement.find()
            .populate('etudiant ecole entreprise');
        res.status(200).json(signalements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getSignalementById = async (req, res) => {
    try {
        const signalement = await Signalement.findById(req.params.id)
            .populate('etudiant ecole entreprise');
        if (!signalement) return res.status(404).json({ message: 'Signalement non trouvé' });
        res.status(200).json(signalement);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateSignalement = async (req, res) => {
    try {
        const signalement = await Signalement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!signalement) return res.status(404).json({ message: 'Signalement non trouvé' });
        res.status(200).json(signalement);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteSignalement = async (req, res) => {
    try {
        const signalement = await Signalement.findByIdAndDelete(req.params.id);
        if (!signalement) return res.status(404).json({ message: 'Signalement non trouvé' });
        res.status(200).json({ message: 'Signalement supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


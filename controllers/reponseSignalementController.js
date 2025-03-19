const ReponseSignalement = require('../models/reponseSignalement');
require('../models/signalement');

exports.createReponseSignalement = async (req, res) => {
    try {
        const reponse = new ReponseSignalement(req.body);
        const savedReponse = await reponse.save();
        res.status(201).json(savedReponse);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllReponsesSignalement = async (req, res) => {
    try {
        const reponses = await ReponseSignalement.find().populate('signalement');
        res.status(200).json(reponses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getReponseSignalementById = async (req, res) => {
    try {
        const reponse = await ReponseSignalement.findById(req.params.id).populate('signalement');
        if (!reponse) return res.status(404).json({ message: 'Réponse non trouvée' });
        res.status(200).json(reponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateReponseSignalement = async (req, res) => {
    try {
        const reponse = await ReponseSignalement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reponse) return res.status(404).json({ message: 'Réponse non trouvée' });
        res.status(200).json(reponse);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteReponseSignalement = async (req, res) => {
    try {
        const reponse = await ReponseSignalement.findByIdAndDelete(req.params.id);
        if (!reponse) return res.status(404).json({ message: 'Réponse non trouvée' });
        res.status(200).json({ message: 'Réponse supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


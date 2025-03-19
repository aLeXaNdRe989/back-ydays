const Evaluation = require('../models/evaluation');
require('../models/utilisateur');

exports.createEvaluation = async (req, res) => {
    try {
        const evaluation = new Evaluation(req.body);
        const savedEvaluation = await evaluation.save();
        res.status(201).json(savedEvaluation);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find().populate('utilisateur');
        res.status(200).json(evaluations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getEvaluationById = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id).populate('utilisateur');
        if (!evaluation) return res.status(404).json({ message: 'Evaluation non trouvée' });
        res.status(200).json(evaluation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!evaluation) return res.status(404).json({ message: 'Evaluation non trouvée' });
        res.status(200).json(evaluation);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
        if (!evaluation) return res.status(404).json({ message: 'Evaluation non trouvée' });
        res.status(200).json({ message: 'Evaluation supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

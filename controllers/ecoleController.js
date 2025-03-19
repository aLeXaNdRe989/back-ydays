const Ecole = require('../models/ecole');
require('../models/photo');
require('../models/diplome');

exports.createEcole = async (req, res) => {
    try {
        const ecole = new Ecole(req.body);
        const savedEcole = await ecole.save();
        res.status(201).json(savedEcole);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllEcoles = async (req, res) => {
    try {
        const ecoles = await Ecole.find().populate('diplome images');
        res.status(200).json(ecoles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getEcoleById = async (req, res) => {
    try {
        const ecole = await Ecole.findById(req.params.id).populate('diplome images');
        if (!ecole) return res.status(404).json({ message: 'Ecole non trouvée' });
        res.status(200).json(ecole);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateEcole = async (req, res) => {
    try {
        const ecole = await Ecole.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ecole) return res.status(404).json({ message: 'Ecole non trouvée' });
        res.status(200).json(ecole);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEcole = async (req, res) => {
    try {
        const ecole = await Ecole.findByIdAndDelete(req.params.id);
        if (!ecole) return res.status(404).json({ message: 'Ecole non trouvée' });
        res.status(200).json({ message: 'Ecole supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

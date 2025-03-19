const Partenaire = require('../models/partenaires');
require('../models/photo');

exports.createPartenaire = async (req, res) => {
    try {
        const partenaire = new Partenaire(req.body);
        const savedPartenaire = await partenaire.save();
        res.status(201).json(savedPartenaire);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllPartenaires = async (req, res) => {
    try {
        const partenaires = await Partenaire.find().populate('logo images');
        res.status(200).json(partenaires);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getPartenaireById = async (req, res) => {
    try {
        const partenaire = await Partenaire.findById(req.params.id).populate('logo images');
        if (!partenaire) return res.status(404).json({ message: 'Partenaire non trouvé' });
        res.status(200).json(partenaire);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updatePartenaire = async (req, res) => {
    try {
        const partenaire = await Partenaire.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!partenaire) return res.status(404).json({ message: 'Partenaire non trouvé' });
        res.status(200).json(partenaire);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deletePartenaire = async (req, res) => {
    try {
        const partenaire = await Partenaire.findByIdAndDelete(req.params.id);
        if (!partenaire) return res.status(404).json({ message: 'Partenaire non trouvé' });
        res.status(200).json({ message: 'Partenaire supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const Diplome = require('../models/diplome');

exports.createDiplome = async (req, res) => {
    try {
        const diplome = new Diplome(req.body);
        const savedDiplome = await diplome.save();
        res.status(201).json(savedDiplome);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllDiplomes = async (req, res) => {
    try {
        const diplomes = await Diplome.find().populate('images');
        res.status(200).json(diplomes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getDiplomeById = async (req, res) => {
    try {
        const diplome = await Diplome.findById(req.params.id).populate('images');
        if (!diplome) return res.status(404).json({ message: 'Diplome non trouvé' });
        res.status(200).json(diplome);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateDiplome = async (req, res) => {
    try {
        const { libelle, description, urlofficiel, niveau, images } = req.body;
        const diplome = await Diplome.findByIdAndUpdate(req.params.id, { libelle, description, urlofficiel, niveau, images }, { new: true });
        if (!diplome) return res.status(404).json({ message: 'Diplome non trouvé' });
        res.status(200).json(diplome);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deleteDiplome = async (req, res) => {
    try {
        const diplome = await Diplome.findByIdAndDelete(req.params.id);
        if (!diplome) return res.status(404).json({ message: 'Diplome non trouvé' });
        res.status(200).json({ message: 'Diplome supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

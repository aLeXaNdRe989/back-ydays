const Photo = require('../models/photo');

exports.createPhoto = async (req, res) => {
    try {
        const photo = new Photo(req.body);
        const savedPhoto = await photo.save();
        res.status(201).json(savedPhoto);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.getAllPhotos = async (req, res) => {
    try {
        const photos = await Photo.find();
        res.status(200).json(photos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getPhotoById = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);
        if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });
        res.status(200).json(photo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updatePhoto = async (req, res) => {
    try {
        const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });
        res.status(200).json(photo);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

exports.deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findByIdAndDelete(req.params.id);
        if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });
        res.status(200).json({ message: 'Photo supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

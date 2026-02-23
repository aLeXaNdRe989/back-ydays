const mongoose = require('mongoose');

const favoriSchema = new mongoose.Schema({
    candidat: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    offre: { type: mongoose.Schema.Types.ObjectId, ref: 'Offre', required: true }
}, { timestamps: true });

favoriSchema.index({ candidat: 1, offre: 1 }, { unique: true });

module.exports = mongoose.model('Favori', favoriSchema);

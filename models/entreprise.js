const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String },
    adresse: { type: String },
    email: { type: String, required: true, unique: true },
    logo: { type: String }, // URL vers l'image ou base64
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }], // tableau de photos liées
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Entreprise', entrepriseSchema);

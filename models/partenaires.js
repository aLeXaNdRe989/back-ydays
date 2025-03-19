const mongoose = require('mongoose');

const partenairesSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    type: { type: String, enum: ['Ecole', 'Entreprise'], required: true },
    logo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
}, { timestamps: true });

module.exports = mongoose.model('Partenaires', partenairesSchema);

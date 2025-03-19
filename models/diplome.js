const mongoose = require('mongoose');

const diplomeSchema = new mongoose.Schema({
    libelle: { type: String, required: true },
    description: { type: String },
    urlofficiel: { type: String },
    niveau: { type: Number },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
}, { timestamps: true });

module.exports = mongoose.model('Diplome', diplomeSchema);

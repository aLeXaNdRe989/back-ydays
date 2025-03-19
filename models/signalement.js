const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema({
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', default: null },
    ecole: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecole', default: null },
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', default: null },
    titre: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Signalement', signalementSchema);

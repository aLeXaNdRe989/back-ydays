const mongoose = require('mongoose');

const fichiersSchema = new mongoose.Schema({
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    libelle: { type: String, required: true },
    fichier: { type: String, required: true } // URL vers le fichier ou path local
}, { timestamps: true });

module.exports = mongoose.model('Fichiers', fichiersSchema);

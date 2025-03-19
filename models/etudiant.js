const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    ecole: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecole' },
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
    dateDebut: { type: Date, required: true },
    dateDiplome: { type: Date, default: null },
    dateEmbauche: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Etudiant', etudiantSchema);

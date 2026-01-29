const mongoose = require('mongoose');

const candidatureSchema = new mongoose.Schema({
    offre: { type: mongoose.Schema.Types.ObjectId, ref: 'Offre', required: true },
    candidat: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    message: { type: String, maxlength: 2000 },
    statut: {
        type: String,
        enum: ['en_attente', 'vue', 'acceptee', 'refusee'],
        default: 'en_attente'
    },
    dateReponse: { type: Date },
    reponseEntreprise: { type: String }
}, { timestamps: true });

// Index unique pour eviter les candidatures en double
candidatureSchema.index({ offre: 1, candidat: 1 }, { unique: true });

// Index pour recherche rapide
candidatureSchema.index({ candidat: 1, createdAt: -1 });
candidatureSchema.index({ offre: 1, statut: 1 });

module.exports = mongoose.model('Candidature', candidatureSchema);

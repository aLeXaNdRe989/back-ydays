const mongoose = require('mongoose');

const offreSchema = new mongoose.Schema({
    // Relation avec l'entreprise
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },

    // Informations principales
    titre: { type: String, required: true, maxlength: 200 },
    typeContrat: {
        type: String,
        enum: ['apprentissage', 'professionnalisation'],
        default: 'apprentissage'
    },
    description: { type: String, required: true, maxlength: 5000 },
    profilRecherche: { type: String, maxlength: 2000 },
    competences: [{ type: String }],
    niveauEtudes: { type: String },

    // Conditions du contrat
    duree: { type: String },
    rythme: { type: String },
    dateDebut: { type: Date },
    dateLimite: { type: Date },
    remuneration: { type: String },
    teletravail: {
        type: String,
        enum: ['non', 'partiel', 'oui'],
        default: 'non'
    },
    avantages: { type: String },

    // Localisation
    lieu: { type: String, required: true },
    codePostal: { type: String },

    // Statut
    statut: {
        type: String,
        enum: ['active', 'pourvue', 'fermee'],
        default: 'active'
    },

    // Anciennes references (compatibilite)
    diplome: { type: mongoose.Schema.Types.ObjectId, ref: 'Diplome' },
    ecole: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecole' },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
}, { timestamps: true });

// Index pour recherche
offreSchema.index({ titre: 'text', description: 'text', lieu: 'text' });
offreSchema.index({ entreprise: 1, createdAt: -1 });
offreSchema.index({ statut: 1, dateLimite: 1 });

module.exports = mongoose.model('Offre', offreSchema);

const mongoose = require('mongoose');

const offreSchema = new mongoose.Schema({
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    diplome: { type: mongoose.Schema.Types.ObjectId, ref: 'Diplome' },
    ecole: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecole' },
    startDate: { type: Date },
    state: { type: Number }, // Exemple : 1 = ouvert, 0 = fermé
    experience: { type: Number }, // en années
    degree: { type: Number }, // niveau de diplôme
    description: { type: String, maxlength: 300 },
    contractType: { type: Number }, // CDI, CDD, stage, etc.
    salary: { type: Number }, // salaire annuel ou mensuel
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
}, { timestamps: true });

module.exports = mongoose.model('Offre', offreSchema);

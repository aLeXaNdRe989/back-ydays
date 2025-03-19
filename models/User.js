const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: String },
    password: { type: String, required: true },
    logo: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
    role: { type: String, enum: ['candidat', 'entreprise', 'admin'], default: 'candidat' }
}, { timestamps: true });

module.exports = mongoose.model('Utilisateur', utilisateurSchema);

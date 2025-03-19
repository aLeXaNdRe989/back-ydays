const mongoose = require('mongoose');

const ecoleSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String },
    diplome: { type: mongoose.Schema.Types.ObjectId, ref: 'Diplome' },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
}, { timestamps: true });

module.exports = mongoose.model('Ecole', ecoleSchema);

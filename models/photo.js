const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    photo: { type: String, required: true }, // URL ou Base64
    table: {
        type: String,
        enum: ['entreprise', 'ecole', 'offre', 'utilisateur', 'diplome'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Photo', photoSchema);

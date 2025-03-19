const mongoose = require('mongoose');

const reponseSignalementSchema = new mongoose.Schema({
    signalement: { type: mongoose.Schema.Types.ObjectId, ref: 'Signalement', required: true },
    numero: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReponseSignalement', reponseSignalementSchema);

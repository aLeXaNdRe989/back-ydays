const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    note: { type: Number, required: true },
    commentaire: { type: String },
    atouts: [{
        type: String,
        enum: ['Accompagnement', 'Enseignements', 'Intervenants', 'Pédagogie']
    }],
    faiblesses: [{
        type: String,
        enum: ['Accompagnement', 'Enseignements', 'Intervenants', 'Pédagogie']
    }]
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);

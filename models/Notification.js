const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    type: {
        type: String,
        enum: ['nouvelle_candidature', 'candidature_acceptee', 'candidature_refusee', 'candidature_vue'],
        required: true
    },
    message: { type: String, required: true },
    lue: { type: Boolean, default: false },
    offre: { type: mongoose.Schema.Types.ObjectId, ref: 'Offre' },
    candidature: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidature' }
}, { timestamps: true });

notificationSchema.index({ destinataire: 1, createdAt: -1 });
notificationSchema.index({ destinataire: 1, lue: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

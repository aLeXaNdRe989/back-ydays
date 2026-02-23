const Notification = require('../models/Notification');

async function createNotification(destinataireId, type, message, refs = {}) {
    try {
        await Notification.create({
            destinataire: destinataireId,
            type,
            message,
            offre: refs.offre || undefined,
            candidature: refs.candidature || undefined
        });
    } catch (err) {
        console.error('Erreur creation notification:', err.message);
    }
}

module.exports = { createNotification };

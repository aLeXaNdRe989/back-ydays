const Notification = require('../models/Notification');

exports.getMesNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ destinataire: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const nonLues = await Notification.countDocuments({ destinataire: req.user._id, lue: false });

        res.status(200).json({ notifications, nonLues });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, destinataire: req.user._id },
            { lue: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ msg: 'Notification non trouvee' });
        }

        res.status(200).json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { destinataire: req.user._id, lue: false },
            { lue: true }
        );

        res.status(200).json({ msg: 'Toutes les notifications marquees comme lues' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

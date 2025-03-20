exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès interdit' });
        }
        next();
    };
};

const Entreprise = require('../models/entreprise');

exports.restrictToOwnerOrAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        const entrepriseId = req.params.id;

        const entreprise = await Entreprise.findById(entrepriseId);

        if (!entreprise) {
            return res.status(404).json({ message: 'Entreprise non trouvée' });
        }

        // Cas 1 : Admin : OK
        if (user.role === 'admin') {
            return next();
        }

        // Cas 2 : Entreprise + c'est la sienne : OK
        if (user.role === 'entreprise' && entreprise.createdBy.equals(user._id)) {
            return next();
        }

        // Sinon : accès interdit
        return res.status(403).json({ message: 'Accès interdit : non propriétaire' });

    } catch (error) {
        console.error('Erreur auth:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};
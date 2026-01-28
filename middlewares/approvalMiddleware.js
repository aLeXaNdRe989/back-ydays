exports.requireApproval = (req, res, next) => {
    // Les admins n'ont pas besoin d'approbation
    if (req.user.role === 'admin') {
        return next();
    }

    // Vérifier si l'utilisateur est approuvé
    if (req.user.isApproved === 'pending') {
        return res.status(403).json({
            message: 'Votre compte est en attente de validation par un administrateur',
            status: 'pending'
        });
    }

    if (req.user.isApproved === 'rejected') {
        return res.status(403).json({
            message: 'Votre compte a été rejeté',
            status: 'rejected',
            reason: req.user.rejectionReason
        });
    }

    next();
};

const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur');

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non autorisé, token manquant' });
    }

    try {
        token = token.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Utilisateur.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Non autorisé' });
    }
};

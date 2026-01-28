const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');
const Offre = require('../models/offre');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            pendingUsers,
            totalEntreprises,
            pendingEntreprises,
            totalOffres
        ] = await Promise.all([
            // Compter uniquement les candidats (exclure admin et entreprise)
            Utilisateur.countDocuments({ role: 'candidat' }),
            // Compter uniquement les candidats en attente (pas les entreprises)
            Utilisateur.countDocuments({ role: 'candidat', isApproved: 'pending' }),
            Entreprise.countDocuments(),
            Entreprise.countDocuments({ isApproved: 'pending' }),
            Offre.countDocuments()
        ]);

        res.json({
            totalUsers,
            pendingUsers,
            totalEntreprises,
            pendingEntreprises,
            totalOffres
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Users management
exports.getAllUsersAdmin = async (req, res) => {
    try {
        const { status, role, page = 1, limit = 20 } = req.query;
        const query = { role: { $ne: 'admin' } };

        if (status) query.isApproved = status;
        if (role) query.role = role;

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            Utilisateur.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Utilisateur.countDocuments(query)
        ]);

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, rejectionReason } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(isApproved)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const updateData = { isApproved };
        if (isApproved === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        if (isApproved === 'approved') {
            updateData.rejectionReason = null;
        }

        const user = await Utilisateur.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        // Si c'est une entreprise, mettre à jour aussi le profil entreprise associé
        if (user.role === 'entreprise') {
            await Entreprise.updateMany(
                { createdBy: user._id },
                { isApproved, rejectionReason: isApproved === 'rejected' ? rejectionReason : null }
            );
        }

        res.json({ message: 'Statut mis à jour', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUserAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await Utilisateur.findById(id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Impossible de supprimer un administrateur' });
        }

        // Supprimer les entreprises et offres associées si c'est une entreprise
        if (user.role === 'entreprise') {
            const entreprises = await Entreprise.find({ createdBy: user._id });
            const entrepriseIds = entreprises.map(e => e._id);
            await Offre.deleteMany({ entreprise: { $in: entrepriseIds } });
            await Entreprise.deleteMany({ createdBy: user._id });
        }

        await Utilisateur.findByIdAndDelete(id);

        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Entreprises management
exports.getAllEntreprisesAdmin = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.isApproved = status;

        const skip = (page - 1) * limit;

        const [entreprises, total] = await Promise.all([
            Entreprise.find(query)
                .populate('createdBy', 'nom prenom email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Entreprise.countDocuments(query)
        ]);

        res.json({
            entreprises,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateEntrepriseApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, rejectionReason } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(isApproved)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const updateData = { isApproved };
        if (isApproved === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }
        if (isApproved === 'approved') {
            updateData.rejectionReason = null;
        }

        const entreprise = await Entreprise.findByIdAndUpdate(id, updateData, { new: true });
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        // Mettre à jour aussi l'utilisateur associé
        await Utilisateur.findByIdAndUpdate(
            entreprise.createdBy,
            { isApproved, rejectionReason: isApproved === 'rejected' ? rejectionReason : null }
        );

        res.json({ message: 'Statut mis à jour', entreprise });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEntrepriseAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const entreprise = await Entreprise.findById(id);
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        // Supprimer les offres associées
        await Offre.deleteMany({ entreprise: id });

        // Supprimer l'entreprise
        await Entreprise.findByIdAndDelete(id);

        res.json({ message: 'Entreprise supprimée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Offres management
exports.getAllOffresAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [offres, total] = await Promise.all([
            Offre.find()
                .populate('entreprise', 'nom')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Offre.countDocuments()
        ]);

        res.json({
            offres,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOffreAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const offre = await Offre.findByIdAndDelete(id);
        if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });

        res.json({ message: 'Offre supprimée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

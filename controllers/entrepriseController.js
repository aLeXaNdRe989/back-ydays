const Entreprise = require('../models/entreprise');

// ➡️ Créer un profil entreprise pour l'utilisateur connecté
exports.createEntreprise = async (req, res) => {
    try {
        // On récupère les champs que le front enverra
        const { nom, description, adresse, email, logo, images } = req.body;

        // Sécurité : on s'assure qu'il y a bien un utilisateur dans req.user
        if (!req.user) {
            return res.status(401).json({ message: 'Utilisateur non authentifié' });
        }

        // Optionnel : vérifier que le rôle est bien "entreprise" ou "admin"
        if (!['entreprise', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Seuls les comptes entreprise ou admin peuvent créer un profil entreprise.' });
        }

        // Vérifier si un profil existe déjà pour ce user
        const existing = await Entreprise.findOne({ createdBy: req.user._id });
        if (existing) {
            return res.status(400).json({
                message: 'Un profil entreprise existe déjà pour cet utilisateur.',
                entrepriseId: existing._id
            });
        }

        // Créer l'entreprise en liant bien au user connecté
        const entreprise = new Entreprise({
            nom,
            description,
            adresse,
            // si le front n'envoie pas d'email, on utilise celui du compte
            email: email || req.user.email,
            logo,
            images,
            createdBy: req.user._id
        });

        const savedEntreprise = await entreprise.save();
        res.status(201).json(savedEntreprise);
    } catch (err) {
        console.error('Erreur dans createEntreprise:', err);
        res.status(400).json({ error: err.message });
    }
};

// ➡️ Récupérer toutes les entreprises (utilisé pour la liste / carte)
exports.getAllEntreprises = async (req, res) => {
    try {
        const entreprises = await Entreprise.find().populate('images');
        res.status(200).json(entreprises);
    } catch (err) {
        console.error('Erreur dans getAllEntreprises:', err);
        res.status(500).json({ error: err.message });
    }
};

// ➡️ Récupérer une entreprise par ID
exports.getEntrepriseById = async (req, res) => {
    try {
        const entreprise = await Entreprise.findById(req.params.id).populate('images');
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        res.status(200).json(entreprise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ➡️ Mettre à jour une entreprise
exports.updateEntreprise = async (req, res) => {
    try {
        const { nom, description, adresse, logo, images } = req.body;
        const entreprise = await Entreprise.findByIdAndUpdate(
            req.params.id,
            { nom, description, adresse, logo, images },
            { new: true }
        );
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        res.status(200).json(entreprise);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ➡️ Supprimer une entreprise
exports.deleteEntreprise = async (req, res) => {
    try {
        const entreprise = await Entreprise.findByIdAndDelete(req.params.id);
        if (!entreprise) return res.status(404).json({ message: 'Entreprise non trouvée' });

        res.status(200).json({ message: 'Entreprise supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ➡️ Récupérer le profil entreprise du user connecté
exports.getMyEntreprise = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Utilisateur non authentifié' });
        }

        const entreprise = await Entreprise.findOne({ createdBy: req.user._id }).populate('images');

        if (!entreprise) {
            return res.status(404).json({ message: 'Aucun profil entreprise trouvé pour cet utilisateur.' });
        }

        res.status(200).json(entreprise);
    } catch (err) {
        console.error('Erreur dans getMyEntreprise:', err);
        res.status(500).json({ error: err.message });
    }
};
const Offre = require('../models/offre');
const Entreprise = require('../models/entreprise');
const Candidature = require('../models/Candidature');
require('../models/photo');

// Creer une offre (entreprise connectee)
exports.createOffre = async (req, res) => {
    try {
        const userId = req.user._id;

        // Verifier que l'utilisateur est une entreprise
        if (req.user.role !== 'entreprise' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Seules les entreprises peuvent creer des offres' });
        }

        // Trouver l'entreprise de l'utilisateur
        const entreprise = await Entreprise.findOne({ createdBy: userId });
        if (!entreprise) {
            return res.status(404).json({ msg: 'Entreprise non trouvee pour cet utilisateur' });
        }

        // Verifier que l'entreprise est approuvee
        if (entreprise.isApproved !== 'approved') {
            return res.status(403).json({ msg: 'Votre entreprise doit etre approuvee pour publier des offres' });
        }

        const {
            titre,
            typeContrat,
            description,
            profilRecherche,
            competences,
            niveauEtudes,
            duree,
            rythme,
            dateDebut,
            dateLimite,
            remuneration,
            teletravail,
            avantages,
            lieu,
            codePostal
        } = req.body;

        const offre = new Offre({
            entreprise: entreprise._id,
            createdBy: userId,
            titre,
            typeContrat,
            description,
            profilRecherche,
            competences: competences || [],
            niveauEtudes,
            duree,
            rythme,
            dateDebut: dateDebut ? new Date(dateDebut) : undefined,
            dateLimite: dateLimite ? new Date(dateLimite) : undefined,
            remuneration,
            teletravail,
            avantages,
            lieu,
            codePostal
        });

        const savedOffre = await offre.save();
        res.status(201).json(savedOffre);
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message });
    }
};

// Recuperer les offres de l'entreprise connectee
exports.getMesOffres = async (req, res) => {
    try {
        const userId = req.user._id;

        // Trouver l'entreprise de l'utilisateur
        const entreprise = await Entreprise.findOne({ createdBy: userId });
        if (!entreprise) {
            return res.status(404).json({ msg: 'Entreprise non trouvee' });
        }

        const offres = await Offre.find({ entreprise: entreprise._id })
            .sort({ createdAt: -1 })
            .populate('entreprise');

        res.status(200).json({ offres });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Recuperer toutes les offres (publique)
exports.getAllOffres = async (req, res) => {
    try {
        const { page = 1, limit = 20, lieu, typeContrat, niveauEtudes, search } = req.query;
        const skip = (page - 1) * limit;

        // Construire le filtre
        const filter = { statut: 'active' };

        if (lieu) filter.lieu = new RegExp(lieu, 'i');
        if (typeContrat) filter.typeContrat = typeContrat;
        if (niveauEtudes) filter.niveauEtudes = niveauEtudes;
        if (search) {
            filter.$or = [
                { titre: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const [offres, total] = await Promise.all([
            Offre.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('entreprise', 'nom logo'),
            Offre.countDocuments(filter)
        ]);

        res.status(200).json({
            offres,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Recuperer une offre par ID
exports.getOffreById = async (req, res) => {
    try {
        const offre = await Offre.findById(req.params.id)
            .populate('entreprise', 'nom description adresse email logo');

        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        res.status(200).json(offre);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Mettre a jour une offre
exports.updateOffre = async (req, res) => {
    try {
        const userId = req.user._id;
        const offreId = req.params.id;

        const offre = await Offre.findById(offreId);
        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        // Verifier que l'utilisateur est le createur ou admin
        if (offre.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Non autorise a modifier cette offre' });
        }

        const updatedOffre = await Offre.findByIdAndUpdate(
            offreId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedOffre);
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: err.message });
    }
};

// Supprimer une offre
exports.deleteOffre = async (req, res) => {
    try {
        const userId = req.user._id;
        const offreId = req.params.id;

        const offre = await Offre.findById(offreId);
        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        // Verifier que l'utilisateur est le createur ou admin
        if (offre.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Non autorise a supprimer cette offre' });
        }

        await Offre.findByIdAndDelete(offreId);
        res.status(200).json({ msg: 'Offre supprimee' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Candidater a une offre
exports.candidater = async (req, res) => {
    try {
        const userId = req.user._id;
        const offreId = req.params.id;
        const { message } = req.body;

        // Verifier que l'utilisateur est un candidat
        if (req.user.role !== 'candidat') {
            return res.status(403).json({ msg: 'Seuls les candidats peuvent postuler aux offres' });
        }

        // Verifier que l'offre existe et est active
        const offre = await Offre.findById(offreId);
        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        if (offre.statut !== 'active') {
            return res.status(400).json({ msg: 'Cette offre n\'est plus disponible' });
        }

        // Verifier si une candidature existe deja
        const existingCandidature = await Candidature.findOne({
            offre: offreId,
            candidat: userId
        });

        if (existingCandidature) {
            return res.status(400).json({ msg: 'Vous avez deja postule a cette offre' });
        }

        // Creer la candidature
        const candidature = new Candidature({
            offre: offreId,
            candidat: userId,
            message: message || ''
        });

        await candidature.save();

        res.status(201).json({
            msg: 'Candidature envoyee avec succes',
            candidature
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Recuperer mes candidatures (pour un candidat)
exports.getMesCandidatures = async (req, res) => {
    try {
        const userId = req.user._id;

        const candidatures = await Candidature.find({ candidat: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'offre',
                populate: { path: 'entreprise', select: 'nom logo' }
            });

        res.status(200).json({ candidatures });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Recuperer les candidatures d'une offre (pour l'entreprise)
exports.getCandidaturesOffre = async (req, res) => {
    try {
        const userId = req.user._id;
        const offreId = req.params.id;

        // Verifier que l'offre appartient a l'utilisateur
        const offre = await Offre.findById(offreId);
        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        if (offre.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Non autorise' });
        }

        const candidatures = await Candidature.find({ offre: offreId })
            .sort({ createdAt: -1 })
            .populate('candidat', 'nom prenom email telephone');

        res.status(200).json({ candidatures });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

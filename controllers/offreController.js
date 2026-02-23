const Offre = require('../models/offre');
const Entreprise = require('../models/entreprise');
const Candidature = require('../models/Candidature');
const Favori = require('../models/Favori');
const { createNotification } = require('../utils/notificationHelper');

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
            salaireMin,
            salaireMax,
            teletravail,
            avantages,
            lieu,
            codePostal,
            secteur
        } = req.body;

        if (salaireMin != null && salaireMax != null && Number(salaireMin) > Number(salaireMax)) {
            return res.status(400).json({ msg: 'Le salaire minimum ne peut pas etre superieur au salaire maximum' });
        }

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
            salaireMin: salaireMin != null ? Number(salaireMin) : undefined,
            salaireMax: salaireMax != null ? Number(salaireMax) : undefined,
            teletravail,
            avantages,
            lieu,
            codePostal,
            secteur
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
        const parsedLimit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        const parsedPage = Math.max(parseInt(req.query.page) || 1, 1);
        const skip = (parsedPage - 1) * parsedLimit;
        const { lieu, typeContrat, niveauEtudes, search, secteur, salaireMin, salaireMax } = req.query;

        // Construire le filtre
        const filter = { statut: 'active' };

        if (lieu) filter.lieu = { $regex: escapeRegex(lieu), $options: 'i' };
        if (typeContrat) filter.typeContrat = typeContrat;
        if (niveauEtudes) filter.niveauEtudes = niveauEtudes;
        if (secteur) filter.secteur = secteur;
        if (salaireMin) filter.salaireMax = { $gte: Number(salaireMin) };
        if (salaireMax) filter.salaireMin = { $lte: Number(salaireMax) };
        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { titre: { $regex: safeSearch, $options: 'i' } },
                { description: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const [offres, total] = await Promise.all([
            Offre.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit)
                .populate('entreprise', 'nom logo'),
            Offre.countDocuments(filter)
        ]);

        res.status(200).json({
            offres,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total,
                pages: Math.ceil(total / parsedLimit)
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

        const { titre, typeContrat, description, profilRecherche, competences,
            niveauEtudes, duree, rythme, dateDebut, dateLimite, remuneration,
            salaireMin, salaireMax,
            teletravail, avantages, lieu, codePostal, diplome, ecole, images,
            secteur } = req.body;

        if (salaireMin != null && salaireMax != null && Number(salaireMin) > Number(salaireMax)) {
            return res.status(400).json({ msg: 'Le salaire minimum ne peut pas etre superieur au salaire maximum' });
        }

        const updatedOffre = await Offre.findByIdAndUpdate(
            offreId,
            { $set: { titre, typeContrat, description, profilRecherche, competences,
                niveauEtudes, duree, rythme, dateDebut, dateLimite, remuneration,
                salaireMin, salaireMax,
                teletravail, avantages, lieu, codePostal, diplome, ecole, images,
                secteur } },
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
        const { message, cv, lettreMotivation } = req.body;

        // Verifier que l'utilisateur est un candidat
        if (req.user.role !== 'candidat') {
            return res.status(403).json({ msg: 'Seuls les candidats peuvent postuler aux offres' });
        }

        // Verifier que l'offre existe et est active
        const offre = await Offre.findById(offreId).populate('entreprise');
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
            message: message || '',
            cv: cv || undefined,
            lettreMotivation: lettreMotivation || undefined
        });

        await candidature.save();

        // Notifier l'entreprise
        if (offre.createdBy) {
            const candidatNom = req.user.prenom ? `${req.user.prenom} ${req.user.nom}` : req.user.nom;
            await createNotification(
                offre.createdBy,
                'nouvelle_candidature',
                `Nouvelle candidature de ${candidatNom} pour "${offre.titre}"`,
                { offre: offreId, candidature: candidature._id }
            );
        }

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

// Mettre a jour le statut d'une candidature (pour l'entreprise)
exports.updateCandidatureStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { offreId, candidatureId } = req.params;
        const { statut, reponseEntreprise } = req.body;

        const validStatuts = ['vue', 'acceptee', 'refusee'];
        if (!validStatuts.includes(statut)) {
            return res.status(400).json({ msg: 'Statut invalide. Valeurs acceptees: vue, acceptee, refusee' });
        }

        // Verifier que l'offre appartient a l'utilisateur
        const offre = await Offre.findById(offreId);
        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        if (offre.createdBy.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Non autorise a gerer les candidatures de cette offre' });
        }

        // Verifier que la candidature appartient a l'offre
        const candidature = await Candidature.findOne({ _id: candidatureId, offre: offreId });
        if (!candidature) {
            return res.status(404).json({ msg: 'Candidature non trouvee pour cette offre' });
        }

        candidature.statut = statut;
        if (reponseEntreprise) candidature.reponseEntreprise = reponseEntreprise;
        if (statut === 'acceptee' || statut === 'refusee') {
            candidature.dateReponse = new Date();
        }

        await candidature.save();

        // Notifier le candidat
        if (statut === 'acceptee' || statut === 'refusee') {
            const statusLabel = statut === 'acceptee' ? 'acceptee' : 'refusee';
            await createNotification(
                candidature.candidat,
                statut === 'acceptee' ? 'candidature_acceptee' : 'candidature_refusee',
                `Votre candidature pour "${offre.titre}" a ete ${statusLabel}`,
                { offre: offreId, candidature: candidatureId }
            );
        }

        res.status(200).json({ msg: 'Statut mis a jour', candidature });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Toggle favori
exports.toggleFavori = async (req, res) => {
    try {
        const userId = req.user._id;
        const offreId = req.params.id;

        if (req.user.role !== 'candidat') {
            return res.status(403).json({ msg: 'Seuls les candidats peuvent ajouter des favoris' });
        }

        const offre = await Offre.findById(offreId);
        if (!offre) {
            return res.status(404).json({ msg: 'Offre non trouvee' });
        }

        const existing = await Favori.findOne({ candidat: userId, offre: offreId });

        if (existing) {
            await Favori.findByIdAndDelete(existing._id);
            return res.status(200).json({ msg: 'Favori retire', favori: false });
        }

        await Favori.create({ candidat: userId, offre: offreId });
        res.status(201).json({ msg: 'Favori ajoute', favori: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// Recuperer mes favoris
exports.getMesFavoris = async (req, res) => {
    try {
        const userId = req.user._id;

        const favoris = await Favori.find({ candidat: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'offre',
                populate: { path: 'entreprise', select: 'nom logo' }
            });

        res.status(200).json({ favoris });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

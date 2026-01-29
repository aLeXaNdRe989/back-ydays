const mongoose = require('mongoose');
const Candidature = require('../../models/Candidature');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require('../../models/utilisateur');

let candidat;
let entrepriseUser;
let entreprise;
let offre;

describe('Candidature Model Test', () => {

    beforeEach(async () => {
        // Creer un candidat
        candidat = await Utilisateur.create({
            nom: 'Candidat',
            prenom: 'Test',
            email: 'candidat@test.com',
            password: 'hashedpassword',
            role: 'candidat',
            isApproved: 'approved'
        });

        // Creer une entreprise
        entrepriseUser = await Utilisateur.create({
            nom: 'Entreprise',
            prenom: 'User',
            email: 'entreprise@test.com',
            password: 'hashedpassword',
            role: 'entreprise',
            isApproved: 'approved'
        });

        entreprise = await Entreprise.create({
            nom: 'Test Entreprise',
            email: 'contact@entreprise.com',
            createdBy: entrepriseUser._id,
            isApproved: 'approved'
        });

        // Creer une offre
        offre = await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Developpeur Web',
            description: 'Offre de test',
            lieu: 'Paris',
            statut: 'active'
        });
    });

    it('Cree une candidature valide', async () => {
        const candidature = new Candidature({
            offre: offre._id,
            candidat: candidat._id,
            message: 'Je suis motive pour ce poste'
        });

        const saved = await candidature.save();

        expect(saved._id).toBeDefined();
        expect(saved.offre).toEqual(offre._id);
        expect(saved.candidat).toEqual(candidat._id);
        expect(saved.message).toBe('Je suis motive pour ce poste');
        expect(saved.statut).toBe('en_attente');
    });

    it('Cree une candidature sans message', async () => {
        const candidature = await Candidature.create({
            offre: offre._id,
            candidat: candidat._id
        });

        expect(candidature._id).toBeDefined();
        expect(candidature.message).toBeUndefined();
    });

    it('Ne doit pas sauvegarder une candidature sans offre', async () => {
        const candidatureSansOffre = new Candidature({
            candidat: candidat._id,
            message: 'Test'
        });

        let err;
        try {
            await candidatureSansOffre.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.offre).toBeDefined();
    });

    it('Ne doit pas sauvegarder une candidature sans candidat', async () => {
        const candidatureSansCandidat = new Candidature({
            offre: offre._id,
            message: 'Test'
        });

        let err;
        try {
            await candidatureSansCandidat.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.candidat).toBeDefined();
    });

    it('Doit avoir le statut en_attente par defaut', async () => {
        const candidature = await Candidature.create({
            offre: offre._id,
            candidat: candidat._id
        });

        expect(candidature.statut).toBe('en_attente');
    });

    it('Ne doit pas permettre deux candidatures pour la meme offre par le meme candidat', async () => {
        await Candidature.create({
            offre: offre._id,
            candidat: candidat._id,
            message: 'Premiere candidature'
        });

        let err;
        try {
            await Candidature.create({
                offre: offre._id,
                candidat: candidat._id,
                message: 'Deuxieme candidature'
            });
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe(11000); // Duplicate key error
    });

    it('Doit accepter les differents statuts valides', async () => {
        const candidature = await Candidature.create({
            offre: offre._id,
            candidat: candidat._id
        });

        candidature.statut = 'vue';
        await candidature.save();
        expect(candidature.statut).toBe('vue');

        candidature.statut = 'acceptee';
        await candidature.save();
        expect(candidature.statut).toBe('acceptee');

        candidature.statut = 'refusee';
        await candidature.save();
        expect(candidature.statut).toBe('refusee');
    });
});

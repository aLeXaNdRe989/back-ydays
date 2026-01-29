const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require('../../models/utilisateur');

let createdBy;
let entreprise;

describe('Offre Model Test', () => {

    beforeEach(async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Test',
            prenom: 'User',
            email: 'user@test.com',
            password: 'hashedpassword',
            role: 'entreprise'
        });
        createdBy = utilisateur._id;

        entreprise = await Entreprise.create({
            nom: 'InnovCorp',
            description: 'Entreprise d\'innovation',
            adresse: '123 rue des Startups',
            email: 'contact@innovcorp.com',
            createdBy: createdBy
        });
    });

    it('Cree une offre valide avec une entreprise', async () => {
        const offre = new Offre({
            entreprise: entreprise._id,
            createdBy: createdBy,
            titre: 'Developpeur Full Stack en alternance',
            description: 'Nous recherchons un developpeur motive',
            lieu: 'Paris',
            typeContrat: 'apprentissage',
            niveauEtudes: 'Bac+3'
        });

        const savedOffre = await offre.save();

        expect(savedOffre._id).toBeDefined();
        expect(savedOffre.entreprise).toEqual(entreprise._id);
        expect(savedOffre.titre).toBe('Developpeur Full Stack en alternance');
        expect(savedOffre.lieu).toBe('Paris');
        expect(savedOffre.statut).toBe('active');
    });

    it('Ne doit pas sauvegarder une offre sans entreprise', async () => {
        const offreSansEntreprise = new Offre({
            createdBy: createdBy,
            titre: 'Offre sans entreprise',
            description: 'Description',
            lieu: 'Lyon'
        });

        let err;
        try {
            await offreSansEntreprise.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.entreprise).toBeDefined();
    });

    it('Ne doit pas sauvegarder une offre sans titre', async () => {
        const offreSansTitre = new Offre({
            entreprise: entreprise._id,
            createdBy: createdBy,
            description: 'Description',
            lieu: 'Lyon'
        });

        let err;
        try {
            await offreSansTitre.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.titre).toBeDefined();
    });

    it('Ne doit pas sauvegarder une offre sans lieu', async () => {
        const offreSansLieu = new Offre({
            entreprise: entreprise._id,
            createdBy: createdBy,
            titre: 'Titre',
            description: 'Description'
        });

        let err;
        try {
            await offreSansLieu.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.lieu).toBeDefined();
    });

    it('Doit avoir le statut active par defaut', async () => {
        const offre = await Offre.create({
            entreprise: entreprise._id,
            createdBy: createdBy,
            titre: 'Offre test',
            description: 'Description test',
            lieu: 'Marseille'
        });

        expect(offre.statut).toBe('active');
    });

    it('Doit accepter les competences comme tableau', async () => {
        const offre = await Offre.create({
            entreprise: entreprise._id,
            createdBy: createdBy,
            titre: 'Dev JavaScript',
            description: 'Poste de dev JS',
            lieu: 'Bordeaux',
            competences: ['JavaScript', 'React', 'Node.js']
        });

        expect(offre.competences).toHaveLength(3);
        expect(offre.competences).toContain('React');
    });
});

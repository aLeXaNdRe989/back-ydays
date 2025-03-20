require('dotenv').config({ path: '.env.test' });

const mongoose = require('mongoose');
const app = require('../../app');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require('../../models/utilisateur');

let CreatedBy;

describe('Entreprise Model Test (Atlas)', () => {

    beforeAll(async () => {
        const EntrepriseOwner = await Utilisateur.create({
            nom: 'Test',
            prenom: 'User',
            email: 'user@test.com',
            password: 'hashedpassword'
        });
        CreatedBy = EntrepriseOwner._id;
    });

    it('Création d\'une entreprise valide', async () => {
        const validEntreprise = new Entreprise({
            nom: 'Test Entreprise',
            description: 'Description test',
            adresse: '123 rue des tests',
            email: 'test@entreprise.com',
            logo: 'http://image.com/logo.png',
            createdBy: CreatedBy
        });

        const savedEntreprise = await validEntreprise.save();

        expect(savedEntreprise._id).toBeDefined();
        expect(savedEntreprise.nom).toBe('Test Entreprise');
        expect(savedEntreprise.email).toBe('test@entreprise.com');
    });

    it('Ne doit pas sauvegarder une entreprise sans email', async () => {
        const entrepriseSansEmail = new Entreprise({
            nom: 'Entreprise sans email',
            description: 'Pas d\'email',
            createdBy: CreatedBy
        });

        let err;
        try {
            await entrepriseSansEmail.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });
});

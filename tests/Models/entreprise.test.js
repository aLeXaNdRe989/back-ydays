const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Entreprise = require('../../models/entreprise');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Entreprise Model Test', () => {
    it('Création d\'une entreprise valide', async () => {
        const validEntreprise = new Entreprise({
            nom: 'Test Entreprise',
            description: 'Description test',
            adresse: '123 rue des tests',
            email: 'test@entreprise.com',
            logo: 'http://image.com/logo.png'
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

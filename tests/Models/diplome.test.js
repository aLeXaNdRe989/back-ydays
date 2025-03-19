const mongoose = require('mongoose');
const app = require('../../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Diplome = require('../../models/diplome');

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

describe('Diplome Model Test', () => {
    it('Crée un diplôme valide', async () => {
        const diplome = new Diplome({
            libelle: 'Master Informatique',
            description: 'Diplome avancé en informatique',
            urlofficiel: 'http://univ.com/diplome',
            niveau: 7
        });

        const savedDiplome = await diplome.save();

        expect(savedDiplome._id).toBeDefined();
        expect(savedDiplome.libelle).toBe('Master Informatique');
    });
});

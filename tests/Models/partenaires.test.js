const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Partenaires = require('../../models/partenaires');

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

describe('Partenaires Model Test', () => {
    it('Crée un partenaire valide', async () => {
        const partenaire = new Partenaires({
            nom: 'Entreprise X',
            type: 'Entreprise'
        });

        const savedPartenaire = await partenaire.save();

        expect(savedPartenaire.nom).toBe('Entreprise X');
        expect(savedPartenaire.type).toBe('Entreprise');
    });
});

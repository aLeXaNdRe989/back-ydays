const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Ecole = require('../../models/ecole');
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

describe('Ecole Model Test', () => {
    it('Crée une école avec diplôme', async () => {
        const diplome = new Diplome({
            libelle: 'Bachelor Dev',
            description: 'Diplome de dev',
            urlofficiel: 'http://ecole.com/bachelor',
            niveau: 6
        });

        const savedDiplome = await diplome.save();

        const ecole = new Ecole({
            nom: 'Ydays',
            description: 'Ecole innovante',
            diplome: savedDiplome._id
        });

        const savedEcole = await ecole.save();

        expect(savedEcole.nom).toBe('Ydays');
        expect(savedEcole.diplome).toEqual(savedDiplome._id);
    });
});

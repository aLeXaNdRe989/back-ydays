const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Signalement = require('../../models/signalement');
const ReponseSignalement = require('../../models/reponseSignalement');

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

describe('ReponseSignalement Model Test', () => {
    it('Crée une réponse de signalement liée', async () => {
        const signalement = new Signalement({
            titre: 'Incident',
            description: 'Incident signalé par un étudiant'
        });

        const savedSignalement = await signalement.save();

        const reponse = new ReponseSignalement({
            signalement: savedSignalement._id,
            numero: 1
        });

        const savedReponse = await reponse.save();

        expect(savedReponse.signalement).toEqual(savedSignalement._id);
        expect(savedReponse.numero).toBe(1);
    });
});

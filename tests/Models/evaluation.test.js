const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Evaluation = require('../../models/evaluation');
const Utilisateur = require('../../models/utilisateur');

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

describe('Evaluation Model Test', () => {
    it('Crée une évaluation valide', async () => {
        const utilisateur = new Utilisateur({
            nom: 'Prof',
            prenom: 'John',
            email: 'prof@univ.com',
            password: 'hashed'
        });

        const savedutilisateur = await utilisateur.save();

        const evaluation = new Evaluation({
            utilisateur: savedutilisateur._id,
            note: 4.5,
            commentaire: 'Très bon accompagnement',
            atouts: ['Accompagnement'],
            faiblesses: ['Pédagogie']
        });

        const savedEval = await evaluation.save();

        expect(savedEval.note).toBe(4.5);
        expect(savedEval.commentaire).toContain('accompagnement');
    });
});

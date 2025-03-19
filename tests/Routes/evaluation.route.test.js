const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Evaluation = require('../../models/evaluation');
const Utilisateur = require('../../models/utilisateur');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Evaluation.deleteMany();
    await Utilisateur.deleteMany();
});

describe('Evaluation API', () => {

    it('POST /api/evaluations - doit créer une évaluation', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
            password: 'hashedpassword'
        });

        const res = await request(app)
            .post('/api/evaluations')
            .send({
                utilisateur: utilisateur._id,
                note: 4.5,
                commentaire: 'Très bonne formation',
                atouts: ['Enseignements', 'Pédagogie'],
                faiblesses: ['Intervenants']
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.note).toBe(4.5);
        expect(res.body.commentaire).toBe('Très bonne formation');
    });

    it('GET /api/evaluations - doit retourner une liste d\'évaluations', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Test',
            prenom: 'utilisateur',
            email: 'test.utilisateur@example.com',
            password: 'hashedpassword'
        });

        await Evaluation.create({
            utilisateur: utilisateur._id,
            note: 3.5
        });

        const res = await request(app).get('/api/evaluations');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('GET /api/evaluations/:id - doit retourner une évaluation spécifique', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Jane',
            prenom: 'Doe',
            email: 'jane.doe@example.com',
            password: 'hashedpassword'
        });

        const evaluation = await Evaluation.create({
            utilisateur: utilisateur._id,
            note: 5,
            commentaire: 'Excellente pédagogie'
        });

        const res = await request(app).get(`/api/evaluations/${evaluation._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.commentaire).toBe('Excellente pédagogie');
    });

    it('PUT /api/evaluations/:id - doit mettre à jour une évaluation', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Update',
            prenom: 'utilisateur',
            email: 'update.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const evaluation = await Evaluation.create({
            utilisateur: utilisateur._id,
            note: 2
        });

        const res = await request(app)
            .put(`/api/evaluations/${evaluation._id}`)
            .send({ note: 4 });

        expect(res.statusCode).toBe(200);
        expect(res.body.note).toBe(4);
    });

    it('DELETE /api/evaluations/:id - doit supprimer une évaluation', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Delete',
            prenom: 'utilisateur',
            email: 'delete.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const evaluation = await Evaluation.create({
            utilisateur: utilisateur._id,
            note: 1
        });

        const res = await request(app).delete(`/api/evaluations/${evaluation._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Evaluation supprimée');

        const deleted = await Evaluation.findById(evaluation._id);
        expect(deleted).toBeNull();
    });
});

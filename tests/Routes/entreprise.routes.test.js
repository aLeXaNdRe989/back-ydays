const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Entreprise = require('../../models/entreprise');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // 👇 Important : options recommandées
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Entreprise.deleteMany();
});

describe('Entreprise API', () => {

    it('POST /api/entreprises - doit créer une entreprise', async () => {
        const res = await request(app)
            .post('/api/entreprises')
            .send({
                nom: 'Test Entreprise',
                description: 'Description de test',
                adresse: '123 Rue Test',
                email: 'contact@test.com',
                logo: 'http://logo.com/logo.png'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.nom).toBe('Test Entreprise');
        expect(res.body.email).toBe('contact@test.com');
    });

    it('GET /api/entreprises - doit retourner une liste d\'entreprises', async () => {
        await Entreprise.create({ nom: 'Entreprise 1', email: 'e1@mail.com' });
        await Entreprise.create({ nom: 'Entreprise 2', email: 'e2@mail.com' });

        const res = await request(app).get('/api/entreprises');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].nom).toBe('Entreprise 1');
    });

    it('GET /api/entreprises/:id - doit retourner une entreprise spécifique', async () => {
        const entreprise = await Entreprise.create({ nom: 'Specifique', email: 'spec@mail.com' });

        const res = await request(app).get(`/api/entreprises/${entreprise._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Specifique');
    });

    it('PUT /api/entreprises/:id - doit mettre à jour une entreprise', async () => {
        const entreprise = await Entreprise.create({ nom: 'Old', email: 'old@mail.com' });

        const res = await request(app)
            .put(`/api/entreprises/${entreprise._id}`)
            .send({ nom: 'Updated' });

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Updated');
    });

    it('DELETE /api/entreprises/:id - doit supprimer une entreprise', async () => {
        const entreprise = await Entreprise.create({ nom: 'ToDelete', email: 'delete@mail.com' });

        const res = await request(app).delete(`/api/entreprises/${entreprise._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Entreprise supprimée');

        const deleted = await Entreprise.findById(entreprise._id);
        expect(deleted).toBeNull();
    });
});

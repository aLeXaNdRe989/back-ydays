const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Signalement = require('../../models/signalement');
const Etudiant = require('../../models/etudiant');
const Ecole = require('../../models/ecole');
const Entreprise = require('../../models/entreprise');
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
    await Signalement.deleteMany();
    await Etudiant.deleteMany();
    await Ecole.deleteMany();
    await Entreprise.deleteMany();
    await Utilisateur.deleteMany();
});

describe('Signalement API', () => {

    it('POST /api/signalements - doit créer un signalement', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const res = await request(app)
            .post('/api/signalements')
            .send({
                etudiant: etudiant._id,
                titre: 'Absence de tuteur',
                description: 'Pas de suivi pendant le stage'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.titre).toBe('Absence de tuteur');
        expect(res.body.etudiant).toBe(String(etudiant._id));
    });

    it('GET /api/signalements - doit retourner une liste de signalements', async () => {
        await Signalement.create({ titre: 'Problème 1', description: 'Desc 1' });
        await Signalement.create({ titre: 'Problème 2', description: 'Desc 2' });

        const res = await request(app).get('/api/signalements');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/signalements/:id - doit retourner un signalement spécifique', async () => {
        const signalement = await Signalement.create({
            titre: 'Problème spécifique',
            description: 'Détail spécifique'
        });

        const res = await request(app).get(`/api/signalements/${signalement._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.titre).toBe('Problème spécifique');
    });

    it('PUT /api/signalements/:id - doit mettre à jour un signalement', async () => {
        const signalement = await Signalement.create({
            titre: 'Titre avant modif',
            description: 'Description avant'
        });

        const res = await request(app)
            .put(`/api/signalements/${signalement._id}`)
            .send({ titre: 'Titre après modif' });

        expect(res.statusCode).toBe(200);
        expect(res.body.titre).toBe('Titre après modif');
    });

    it('DELETE /api/signalements/:id - doit supprimer un signalement', async () => {
        const signalement = await Signalement.create({
            titre: 'A supprimer',
            description: 'Signalement à supprimer'
        });

        const res = await request(app).delete(`/api/signalements/${signalement._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Signalement supprimé');

        const deleted = await Signalement.findById(signalement._id);
        expect(deleted).toBeNull();
    });
});

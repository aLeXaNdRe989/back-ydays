const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const ReponseSignalement = require('../../models/reponseSignalement');
const Signalement = require('../../models/signalement');
const Etudiant = require('../../models/etudiant');
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
    await ReponseSignalement.deleteMany();
    await Signalement.deleteMany();
    await Etudiant.deleteMany();
    await Utilisateur.deleteMany();
});

describe('ReponseSignalement API', () => {

    it('POST /api/reponses-signalement - doit créer une réponse de signalement', async () => {
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

        const signalement = await Signalement.create({
            titre: 'Problème de stage',
            description: 'Pas de tuteur',
            etudiant: etudiant._id
        });

        const res = await request(app)
            .post('/api/reponses-signalement')
            .send({
                signalement: signalement._id,
                numero: 1
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.signalement).toBe(String(signalement._id));
        expect(res.body.numero).toBe(1);
    });

    it('GET /api/reponses-signalement - doit retourner une liste de réponses', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Jane',
            prenom: 'Doe',
            email: 'jane.doe@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const signalement = await Signalement.create({
            titre: 'Problème de cours',
            description: 'Pas de prof',
            etudiant: etudiant._id
        });

        await ReponseSignalement.create({
            signalement: signalement._id,
            numero: 1
        });

        const res = await request(app).get('/api/reponses-signalement');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('GET /api/reponses-signalement/:id - doit retourner une réponse spécifique', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Tom',
            prenom: 'Hanks',
            email: 'tom.hanks@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const signalement = await Signalement.create({
            titre: 'Problème d\'évaluation',
            description: 'Pas de retour',
            etudiant: etudiant._id
        });

        const reponse = await ReponseSignalement.create({
            signalement: signalement._id,
            numero: 2
        });

        const res = await request(app).get(`/api/reponses-signalement/${reponse._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.numero).toBe(2);
    });

    it('PUT /api/reponses-signalement/:id - doit mettre à jour une réponse', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Update',
            prenom: 'utilisateur',
            email: 'update.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const signalement = await Signalement.create({
            titre: 'Autre problème',
            description: 'Autre soucis',
            etudiant: etudiant._id
        });

        const reponse = await ReponseSignalement.create({
            signalement: signalement._id,
            numero: 3
        });

        const res = await request(app)
            .put(`/api/reponses-signalement/${reponse._id}`)
            .send({ numero: 4 });

        expect(res.statusCode).toBe(200);
        expect(res.body.numero).toBe(4);
    });

    it('DELETE /api/reponses-signalement/:id - doit supprimer une réponse', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Delete',
            prenom: 'utilisateur',
            email: 'delete.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const signalement = await Signalement.create({
            titre: 'Encore un souci',
            description: 'Pas clair',
            etudiant: etudiant._id
        });

        const reponse = await ReponseSignalement.create({
            signalement: signalement._id,
            numero: 5
        });

        const res = await request(app).delete(`/api/reponses-signalement/${reponse._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Réponse supprimée');

        const deleted = await ReponseSignalement.findById(reponse._id);
        expect(deleted).toBeNull();
    });
});

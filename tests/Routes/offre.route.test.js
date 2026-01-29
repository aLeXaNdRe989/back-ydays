const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require("../../models/utilisateur");

let entrepriseUser;
let entreprise;
let authToken;

// Helper pour creer les donnees de test
const setupTestData = async () => {
    entrepriseUser = await Utilisateur.create({
        nom: 'Test',
        prenom: 'User',
        email: 'entreprise@test.com',
        password: 'hashedpassword',
        role: 'entreprise',
        isApproved: 'approved'
    });

    entreprise = await Entreprise.create({
        nom: 'Test Entreprise',
        email: 'test@entreprise.com',
        createdBy: entrepriseUser._id,
        isApproved: 'approved'
    });

    authToken = jwt.sign({ id: entrepriseUser._id }, process.env.JWT_SECRET || 'test-secret');
};

describe('Offre API', () => {

    beforeEach(async () => {
        await setupTestData();
    });

    it('POST /api/offres - doit creer une offre (avec auth)', async () => {
        const res = await request(app)
            .post('/api/offres')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                titre: 'Developpeur Web Junior',
                description: 'Offre de test pour developpeur',
                lieu: 'Paris',
                typeContrat: 'apprentissage'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.titre).toBe('Developpeur Web Junior');
        expect(res.body.description).toBe('Offre de test pour developpeur');
        expect(res.body.lieu).toBe('Paris');
    });

    it('POST /api/offres - doit refuser sans authentification', async () => {
        const res = await request(app)
            .post('/api/offres')
            .send({
                titre: 'Offre sans auth',
                description: 'Test',
                lieu: 'Lyon'
            });

        expect(res.statusCode).toBe(401);
    });

    it('GET /api/offres - doit retourner une liste d\'offres', async () => {
        await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Offre A',
            description: 'Description A',
            lieu: 'Paris',
            statut: 'active'
        });

        await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Offre B',
            description: 'Description B',
            lieu: 'Lyon',
            statut: 'active'
        });

        const res = await request(app).get('/api/offres');

        expect(res.statusCode).toBe(200);
        expect(res.body.offres).toBeDefined();
        expect(res.body.pagination).toBeDefined();
        expect(res.body.offres.length).toBe(2);
    });

    it('GET /api/offres/:id - doit retourner une offre specifique', async () => {
        const offre = await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Offre specifique',
            description: 'Description specifique',
            lieu: 'Marseille'
        });

        const res = await request(app).get(`/api/offres/${offre._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.titre).toBe('Offre specifique');
    });

    it('GET /api/offres/mes-offres - doit retourner les offres de l\'entreprise connectee', async () => {
        await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Mon offre',
            description: 'Ma description',
            lieu: 'Toulouse'
        });

        const res = await request(app)
            .get('/api/offres/mes-offres')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.offres).toBeDefined();
        expect(res.body.offres.length).toBe(1);
    });

    it('PUT /api/offres/:id - doit mettre a jour une offre (avec auth)', async () => {
        const offre = await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Offre a updater',
            description: 'Description initiale',
            lieu: 'Bordeaux'
        });

        const res = await request(app)
            .put(`/api/offres/${offre._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ titre: 'Offre mise a jour' });

        expect(res.statusCode).toBe(200);
        expect(res.body.titre).toBe('Offre mise a jour');
    });

    it('DELETE /api/offres/:id - doit supprimer une offre (avec auth)', async () => {
        const offre = await Offre.create({
            entreprise: entreprise._id,
            createdBy: entrepriseUser._id,
            titre: 'Offre a supprimer',
            description: 'A supprimer',
            lieu: 'Nantes'
        });

        const res = await request(app)
            .delete(`/api/offres/${offre._id}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Offre supprimee');

        const deleted = await Offre.findById(offre._id);
        expect(deleted).toBeNull();
    });
});

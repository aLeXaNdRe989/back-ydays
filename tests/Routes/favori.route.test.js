const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require('../../models/utilisateur');
const Favori = require('../../models/Favori');

let candidat;
let candidatToken;
let entrepriseUser;
let entrepriseToken;
let entreprise;
let offre;

const setupTestData = async () => {
    candidat = await Utilisateur.create({
        nom: 'Candidat',
        prenom: 'Test',
        email: 'candidat@test.com',
        password: 'hashedpassword',
        role: 'candidat',
        isApproved: 'approved'
    });
    candidatToken = jwt.sign({ id: candidat._id }, process.env.JWT_SECRET || 'test-secret');

    entrepriseUser = await Utilisateur.create({
        nom: 'Entreprise',
        prenom: 'User',
        email: 'entreprise@test.com',
        password: 'hashedpassword',
        role: 'entreprise',
        isApproved: 'approved'
    });
    entrepriseToken = jwt.sign({ id: entrepriseUser._id }, process.env.JWT_SECRET || 'test-secret');

    entreprise = await Entreprise.create({
        nom: 'Test Entreprise',
        email: 'contact@entreprise.com',
        createdBy: entrepriseUser._id,
        isApproved: 'approved'
    });

    offre = await Offre.create({
        entreprise: entreprise._id,
        createdBy: entrepriseUser._id,
        titre: 'Developpeur Web Junior',
        description: 'Offre de test',
        lieu: 'Paris',
        statut: 'active'
    });
};

describe('Favori API', () => {

    beforeEach(async () => {
        await setupTestData();
    });

    describe('POST /api/offres/:id/favori', () => {

        it('Doit ajouter une offre en favori', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/favori`)
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(201);
            expect(res.body.favori).toBe(true);
            expect(res.body.msg).toBe('Favori ajoute');
        });

        it('Doit retirer un favori existant (toggle)', async () => {
            // Ajouter d'abord
            await request(app)
                .post(`/api/offres/${offre._id}/favori`)
                .set('Authorization', `Bearer ${candidatToken}`);

            // Retirer
            const res = await request(app)
                .post(`/api/offres/${offre._id}/favori`)
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.favori).toBe(false);
            expect(res.body.msg).toBe('Favori retire');
        });

        it('Doit refuser pour une entreprise', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/favori`)
                .set('Authorization', `Bearer ${entrepriseToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/favori`);

            expect(res.statusCode).toBe(401);
        });

        it('Doit refuser si l\'offre n\'existe pas', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/offres/${fakeId}/favori`)
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/offres/mes-favoris', () => {

        it('Doit retourner les favoris du candidat', async () => {
            await Favori.create({ candidat: candidat._id, offre: offre._id });

            const res = await request(app)
                .get('/api/offres/mes-favoris')
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.favoris).toBeDefined();
            expect(res.body.favoris.length).toBe(1);
        });

        it('Doit retourner une liste vide si aucun favori', async () => {
            const res = await request(app)
                .get('/api/offres/mes-favoris')
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.favoris).toHaveLength(0);
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .get('/api/offres/mes-favoris');

            expect(res.statusCode).toBe(401);
        });
    });
});

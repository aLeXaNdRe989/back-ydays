const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Utilisateur = require('../../models/utilisateur');
const Entreprise = require('../../models/entreprise');

let adminToken;
let entrepriseToken;
let etudiantToken;
let entrepriseId;
let UserEntrepriseId;

describe('Tests complets Authentification et Rôles', () => {

    beforeAll(async () => {
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();
    });

    beforeEach(async () => {
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();

        // Création des utilisateurs
        await request(app).post('/api/auth/register').send({
            nom: 'Admin',
            prenom: 'Super',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        await request(app).post('/api/auth/register').send({
            nom: 'EntrepriseX',
            prenom: 'Corp',
            email: 'entreprise@test.com',
            password: 'password123',
            role: 'entreprise'
        });

        await request(app).post('/api/auth/register').send({
            nom: 'Etudiant',
            prenom: 'John',
            email: 'etudiant@test.com',
            password: 'password123',
            role: 'candidat'
        });

        // Login des utilisateurs
        const loginAdminRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            });
        adminToken = loginAdminRes.body.token;

        const loginEntrepriseRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'entreprise@test.com',
                password: 'password123'
            });
        entrepriseToken = loginEntrepriseRes.body.token;
        UserEntrepriseId = loginEntrepriseRes.body.utilisateur._id;

        const loginEtudiantRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'etudiant@test.com',
                password: 'password123'
            });
        etudiantToken = loginEtudiantRes.body.token;

        // Création de la fiche entreprise par l'utilisateur entreprise
        const res = await request(app)
            .post('/api/entreprises')
            .set('Authorization', `Bearer ${entrepriseToken}`)
            .send({
                nom: 'EntrepriseX',
                email: 'contact@entreprisex.com',
                description: 'Une entreprise innovante',
                adresse: '123 rue des startups',
                createdBy: UserEntrepriseId
            });

        entrepriseId = res.body._id;
    });


    // --- TESTS START ---
    it('devrait refuser une inscription avec un email déjà utilisé', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Dupont',
                prenom: 'Jean',
                email: 'admin@test.com', // déjà existant
                password: 'password123',
                role: 'candidat'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message || res.body.msg).toMatch(/déjà utilisé/i);
    });

    it('devrait connecter l\'entreprise', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'entreprise@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('devrait refuser un login avec un mauvais mot de passe', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'entreprise@test.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message || res.body.msg).toMatch(/identifiants incorrects/i);
    });

    it('devrait refuser l\'accès sans token', async () => {
        const res = await request(app)
            .get('/api/entreprises');

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/non autorisé/i);
    });

    it('devrait autoriser l\'admin à accéder à la liste des entreprises', async () => {
        const res = await request(app)
            .get('/api/entreprises')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
    });

    it('devrait permettre à l\'admin de mettre à jour l\'entreprise', async () => {
        const res = await request(app)
            .put(`/api/entreprises/${entrepriseId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                description: 'Mise à jour par l\'admin'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.description).toBe('Mise à jour par l\'admin');
    });

    it('devrait permettre à l\'entreprise de modifier sa propre fiche', async () => {
        const res = await request(app)
            .put(`/api/entreprises/${entrepriseId}`)
            .set('Authorization', `Bearer ${entrepriseToken}`)
            .send({
                description: 'Mise à jour par l\'entreprise'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.description).toBe('Mise à jour par l\'entreprise');
    });

    it('devrait refuser à l\'étudiant de modifier l\'entreprise', async () => {
        const res = await request(app)
            .put(`/api/entreprises/${entrepriseId}`)
            .set('Authorization', `Bearer ${etudiantToken}`)
            .send({
                description: 'Hack de la fiche'
            });

        expect(res.statusCode).toBe(403);
    });

    it('devrait permettre à l\'admin de supprimer l\'entreprise', async () => {
        const res = await request(app)
            .delete(`/api/entreprises/${entrepriseId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/supprimée/i);
    });

    it('devrait refuser à l\'entreprise de supprimer sa propre fiche si réservé à l\'admin', async () => {
        const creationRes = await request(app)
            .post('/api/entreprises')
            .set('Authorization', `Bearer ${entrepriseToken}`)
            .send({
                nom: 'Entreprise à tester',
                email: 'contact@testent.com',
                description: 'Test entreprise suppression',
                adresse: '456 rue du test'
            });

        const newEntrepriseId = creationRes.body._id;

        const res = await request(app)
            .delete(`/api/entreprises/${newEntrepriseId}`)
            .set('Authorization', `Bearer ${entrepriseToken}`);

        expect(res.statusCode).toBe(403);
    });

});

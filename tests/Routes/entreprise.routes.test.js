const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require("../../models/utilisateur");

let entrepriseToken;
let CreatedBy;

describe('Entreprise API (avec JWT)', () => {

    beforeAll(async () => {
        // On supprime tout pour partir clean
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();
    });

    beforeEach(async ()=>{
        // Inscription et récupération du token
        const entrepriseOwnerRes = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'Test',
                prenom: 'User',
                email: 'user@test.com',
                password: 'hashedpassword',
                role: 'entreprise'
            });

        const entrepriseOwnerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'user@test.com',
                password: 'hashedpassword'
            });

        const adminOwnerRes = await request(app)
            .post('/api/auth/register')
            .send({
                nom: 'admin',
                prenom: 'User',
                email: 'admin@test.com',
                password: 'hashedpassword',
                role: 'admin'
            });

        const adminOwnerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'hashedpassword'
            });

        CreatedBy = entrepriseOwnerLogin.body.utilisateur._id;
        entrepriseToken = entrepriseOwnerLogin.body.token;
        CreatedByAdmin = adminOwnerLogin.body.utilisateur._id;
        adminToken = adminOwnerLogin.body.token;
    });

    it('POST /api/entreprises - doit créer une entreprise', async () => {
        const res = await request(app)
            .post('/api/entreprises')
            .set('Authorization', `Bearer ${entrepriseToken}`)
            .send({
                nom: 'Test Entreprise',
                description: 'Description de test',
                adresse: '123 Rue Test',
                email: 'contact@test.com',
                logo: 'http://logo.com/logo.png',
                createdBy: CreatedBy
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.nom).toBe('Test Entreprise');
        expect(res.body.email).toBe('contact@test.com');
    });

    it('GET /api/entreprises - doit retourner une liste d\'entreprises', async () => {
        await Entreprise.create({
            nom: 'Entreprise 1',
            email: 'e1@mail.com',
            createdBy: CreatedBy
        });
        await Entreprise.create({
            nom: 'Entreprise 2',
            email: 'e2@mail.com',
            createdBy: CreatedBy
        });

        const res = await request(app)
            .get('/api/entreprises')
            .set('Authorization', `Bearer ${entrepriseToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].nom).toBe('Entreprise 1');
    });

    it('GET /api/entreprises/:id - doit retourner une entreprise spécifique', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Specifique',
            email: 'spec@mail.com',
            createdBy: CreatedBy
        });

        const res = await request(app)
            .get(`/api/entreprises/${entreprise._id}`)
            .set('Authorization', `Bearer ${entrepriseToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Specifique');
    });

    it('PUT /api/entreprises/:id - doit mettre à jour une entreprise', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Old',
            email: 'old@mail.com',
            createdBy: CreatedBy
        });

        const res = await request(app)
            .put(`/api/entreprises/${entreprise._id}`)
            .set('Authorization', `Bearer ${entrepriseToken}`)
            .send({ nom: 'Updated' });

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Updated');
    });

    it('DELETE /api/entreprises/:id - doit supprimer une entreprise', async () => {
        const entreprise = await Entreprise.create({
            nom: 'ToDelete',
            email: 'delete@mail.com',
            createdBy: CreatedByAdmin
        });

        const res = await request(app)
            .delete(`/api/entreprises/${entreprise._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Entreprise supprimée');

        const deleted = await Entreprise.findById(entreprise._id);
        expect(deleted).toBeNull();
    });
});

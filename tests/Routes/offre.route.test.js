const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require("../../models/utilisateur");

let CreatedBy;

describe('Offre API', () => {

    beforeAll(async () => {
        const EntrepriseOwner = await Utilisateur.create({
            nom: 'Test',
            prenom: 'User',
            email: 'user@test.com',
            password: 'hashedpassword'
        });
        CreatedBy = EntrepriseOwner._id;
    });

    it('POST /api/offres - doit créer une offre', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Test Entreprise',
            email: 'test@entreprise.com',
            createdBy: CreatedBy
        });

        const res = await request(app)
            .post('/api/offres')
            .send({
                entreprise: entreprise._id,
                description: 'Offre de test',
                salary: 35000
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.description).toBe('Offre de test');
        expect(res.body.salary).toBe(35000);
    });

    it('GET /api/offres - doit retourner une liste d\'offres', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Entreprise A',
            email: 'a@entreprise.com',
            createdBy: CreatedBy
        });

        await Offre.create({
            entreprise: entreprise._id,
            description: 'Offre A',
            salary: 40000
        });

        await Offre.create({
            entreprise: entreprise._id,
            description: 'Offre B',
            salary: 45000
        });

        const res = await request(app).get('/api/offres');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/offres/:id - doit retourner une offre spécifique', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Entreprise B',
            email: 'b@entreprise.com',
            createdBy: CreatedBy
        });

        const offre = await Offre.create({
            entreprise: entreprise._id,
            description: 'Offre spécifique',
            salary: 50000
        });

        const res = await request(app).get(`/api/offres/${offre._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.description).toBe('Offre spécifique');
    });

    it('PUT /api/offres/:id - doit mettre à jour une offre', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Entreprise C',
            email: 'c@entreprise.com',
            createdBy: CreatedBy
        });

        const offre = await Offre.create({
            entreprise: entreprise._id,
            description: 'Offre à updater',
            salary: 30000
        });

        const res = await request(app)
            .put(`/api/offres/${offre._id}`)
            .send({ salary: 45000 });

        expect(res.statusCode).toBe(200);
        expect(res.body.salary).toBe(45000);
    });

    it('DELETE /api/offres/:id - doit supprimer une offre', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Entreprise D',
            email: 'd@entreprise.com',
            createdBy: CreatedBy
        });

        const offre = await Offre.create({
            entreprise: entreprise._id,
            description: 'Offre à supprimer',
            salary: 60000
        });

        const res = await request(app).delete(`/api/offres/${offre._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Offre supprimée');

        const deleted = await Offre.findById(offre._id);
        expect(deleted).toBeNull();
    });
});

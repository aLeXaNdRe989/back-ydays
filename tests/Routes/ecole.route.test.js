const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Ecole = require('../../models/ecole');
const Diplome = require('../../models/diplome');

describe('Ecole API', () => {

    it('POST /api/ecoles - doit créer une école', async () => {
        const diplome = await Diplome.create({
            libelle: 'Licence Informatique',
            description: 'Un diplome reconnu',
            niveau: 6
        });

        const res = await request(app)
            .post('/api/ecoles')
            .send({
                nom: 'Ecole Test',
                description: 'Une école de test',
                diplome: diplome._id
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.nom).toBe('Ecole Test');
        expect(res.body.diplome).toBe(String(diplome._id));
    });

    it('GET /api/ecoles - doit retourner une liste d\'écoles', async () => {
        await Ecole.create({ nom: 'Ecole A' });
        await Ecole.create({ nom: 'Ecole B' });

        const res = await request(app).get('/api/ecoles');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/ecoles/:id - doit retourner une école spécifique', async () => {
        const ecole = await Ecole.create({ nom: 'Ecole Spécifique' });

        const res = await request(app).get(`/api/ecoles/${ecole._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Ecole Spécifique');
    });

    it('PUT /api/ecoles/:id - doit mettre à jour une école', async () => {
        const ecole = await Ecole.create({ nom: 'Ecole Old' });

        const res = await request(app)
            .put(`/api/ecoles/${ecole._id}`)
            .send({ nom: 'Ecole Updated' });

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Ecole Updated');
    });

    it('DELETE /api/ecoles/:id - doit supprimer une école', async () => {
        const ecole = await Ecole.create({ nom: 'Ecole à supprimer' });

        const res = await request(app).delete(`/api/ecoles/${ecole._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Ecole supprimée');

        const deleted = await Ecole.findById(ecole._id);
        expect(deleted).toBeNull();
    });
});

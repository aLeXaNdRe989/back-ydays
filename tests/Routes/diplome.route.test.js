const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Diplome = require('../../models/diplome');
const { getAuthToken } = require('../helpers/authHelper');

describe('Diplome API', () => {
    let token;

    beforeEach(async () => {
        token = await getAuthToken();
    });

    it('POST /api/diplomes - doit créer un diplome', async () => {
        const res = await request(app)
            .post('/api/diplomes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                libelle: 'Master Informatique',
                description: 'Diplome en info',
                urlofficiel: 'https://univ.com/masterinfo',
                niveau: 7
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.libelle).toBe('Master Informatique');
        expect(res.body.niveau).toBe(7);
    });

    it('GET /api/diplomes - doit retourner une liste de diplomes', async () => {
        await Diplome.create({ libelle: 'Licence', niveau: 6 });
        await Diplome.create({ libelle: 'Master', niveau: 7 });

        const res = await request(app).get('/api/diplomes');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/diplomes/:id - doit retourner un diplome spécifique', async () => {
        const diplome = await Diplome.create({
            libelle: 'Bachelor Dev',
            description: 'Diplome pour développeur',
            niveau: 6
        });

        const res = await request(app).get(`/api/diplomes/${diplome._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.libelle).toBe('Bachelor Dev');
    });

    it('PUT /api/diplomes/:id - doit mettre à jour un diplome', async () => {
        const diplome = await Diplome.create({
            libelle: 'Ancien Diplome',
            niveau: 5
        });

        const res = await request(app)
            .put(`/api/diplomes/${diplome._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ niveau: 6 });

        expect(res.statusCode).toBe(200);
        expect(res.body.niveau).toBe(6);
    });

    it('DELETE /api/diplomes/:id - doit supprimer un diplome', async () => {
        const diplome = await Diplome.create({
            libelle: 'Diplome à supprimer',
            niveau: 4
        });

        const res = await request(app)
            .delete(`/api/diplomes/${diplome._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Diplome supprimé');

        const deleted = await Diplome.findById(diplome._id);
        expect(deleted).toBeNull();
    });
});

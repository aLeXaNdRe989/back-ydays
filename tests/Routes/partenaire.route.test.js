const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Partenaire = require('../../models/partenaires');
const Photo = require('../../models/photo');

describe('Partenaire API', () => {

    it('POST /api/partenaires - doit créer un partenaire', async () => {
        const logo = await Photo.create({ photo: 'http://photos.com/logo1.png', table: 'entreprise' });

        const res = await request(app)
            .post('/api/partenaires')
            .send({
                nom: 'Partenaire Test',
                type: 'Ecole',
                logo: logo._id
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.nom).toBe('Partenaire Test');
        expect(res.body.type).toBe('Ecole');
        expect(res.body.logo).toBe(String(logo._id));
    });

    it('GET /api/partenaires - doit retourner une liste de partenaires', async () => {
        await Partenaire.create({ nom: 'Partenaire 1', type: 'Entreprise' });
        await Partenaire.create({ nom: 'Partenaire 2', type: 'Ecole' });

        const res = await request(app).get('/api/partenaires');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/partenaires/:id - doit retourner un partenaire spécifique', async () => {
        const partenaire = await Partenaire.create({ nom: 'Partenaire Unique', type: 'Entreprise' });

        const res = await request(app).get(`/api/partenaires/${partenaire._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Partenaire Unique');
    });

    it('PUT /api/partenaires/:id - doit mettre à jour un partenaire', async () => {
        const partenaire = await Partenaire.create({ nom: 'Old Partenaire', type: 'Ecole' });

        const res = await request(app)
            .put(`/api/partenaires/${partenaire._id}`)
            .send({ nom: 'Updated Partenaire' });

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Updated Partenaire');
    });

    it('DELETE /api/partenaires/:id - doit supprimer un partenaire', async () => {
        const partenaire = await Partenaire.create({ nom: 'Partenaire à supprimer', type: 'Entreprise' });

        const res = await request(app).delete(`/api/partenaires/${partenaire._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Partenaire supprimé');

        const deleted = await Partenaire.findById(partenaire._id);
        expect(deleted).toBeNull();
    });
});

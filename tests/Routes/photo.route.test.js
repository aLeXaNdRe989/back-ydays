const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Photo = require('../../models/photo');
const { getAuthToken } = require('../helpers/authHelper');

describe('Photo API', () => {
    let token;

    beforeEach(async () => {
        token = await getAuthToken();
    });

    it('POST /api/photos - doit créer une photo', async () => {
        const res = await request(app)
            .post('/api/photos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                photo: 'http://photos.com/image1.png',
                table: 'entreprise'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.photo).toBe('http://photos.com/image1.png');
        expect(res.body.table).toBe('entreprise');
    });

    it('GET /api/photos - doit retourner une liste de photos', async () => {
        await Photo.create({ photo: 'http://photos.com/imageA.png', table: 'ecole' });
        await Photo.create({ photo: 'http://photos.com/imageB.png', table: 'offre' });

        const res = await request(app).get('/api/photos');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('GET /api/photos/:id - doit retourner une photo spécifique', async () => {
        const photo = await Photo.create({
            photo: 'http://photos.com/imageSpecific.png',
            table: 'diplome'
        });

        const res = await request(app).get(`/api/photos/${photo._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.photo).toBe('http://photos.com/imageSpecific.png');
    });

    it('PUT /api/photos/:id - doit mettre à jour une photo', async () => {
        const photo = await Photo.create({
            photo: 'http://photos.com/oldImage.png',
            table: 'utilisateur'
        });

        const res = await request(app)
            .put(`/api/photos/${photo._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ photo: 'http://photos.com/updatedImage.png' });

        expect(res.statusCode).toBe(200);
        expect(res.body.photo).toBe('http://photos.com/updatedImage.png');
    });

    it('DELETE /api/photos/:id - doit supprimer une photo', async () => {
        const photo = await Photo.create({
            photo: 'http://photos.com/deleteImage.png',
            table: 'entreprise'
        });

        const res = await request(app)
            .delete(`/api/photos/${photo._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Photo supprimée');

        const deleted = await Photo.findById(photo._id);
        expect(deleted).toBeNull();
    });
});

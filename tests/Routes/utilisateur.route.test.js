const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Utilisateur = require('../../models/utilisateur');
const Photo = require('../../models/photo');
const { getAuthToken } = require('../helpers/authHelper');

describe('Utilisateur API', () => {
    let token;

    beforeEach(async () => {
        token = await getAuthToken();
    });

    it('POST /api/utilisateurs - doit créer un utilisateur', async () => {
        const logo = await Photo.create({ photo: 'http://photos.com/logo1.png', table: 'utilisateur' });

        const res = await request(app)
            .post('/api/utilisateurs')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nom: 'John',
                prenom: 'Doe',
                email: 'john.doe@example.com',
                telephone: '0601020304',
                password: 'hashedpassword',
                logo: logo._id
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.nom).toBe('John');
    });

    it('GET /api/utilisateurs - doit retourner une liste d\'utilisateurs', async () => {
        const res = await request(app).get('/api/utilisateurs');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/utilisateurs/:id - doit retourner un utilisateur spécifique', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Specific',
            prenom: 'utilisateur',
            email: 'specific.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const res = await request(app).get(`/api/utilisateurs/${utilisateur._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Specific');
    });

    it('PUT /api/utilisateurs/:id - doit mettre à jour un utilisateur', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Old',
            prenom: 'utilisateur',
            email: 'old.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const res = await request(app)
            .put(`/api/utilisateurs/${utilisateur._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nom: 'Updated' });

        expect(res.statusCode).toBe(200);
        expect(res.body.nom).toBe('Updated');
    });

    it('DELETE /api/utilisateurs/:id - doit supprimer un utilisateur', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'ToDelete',
            prenom: 'utilisateur',
            email: 'delete.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const res = await request(app)
            .delete(`/api/utilisateurs/${utilisateur._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Utilisateur supprimé');

        const deleted = await Utilisateur.findById(utilisateur._id);
        expect(deleted).toBeNull();
    });
});

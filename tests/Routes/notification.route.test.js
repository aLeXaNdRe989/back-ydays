const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const Utilisateur = require('../../models/utilisateur');
const Notification = require('../../models/Notification');

let user;
let userToken;

const setupTestData = async () => {
    user = await Utilisateur.create({
        nom: 'User',
        prenom: 'Test',
        email: 'user@test.com',
        password: 'hashedpassword',
        role: 'candidat',
        isApproved: 'approved'
    });
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');
};

describe('Notification API', () => {

    beforeEach(async () => {
        await setupTestData();
    });

    describe('GET /api/notifications', () => {

        it('Doit retourner les notifications de l\'utilisateur', async () => {
            await Notification.create({
                destinataire: user._id,
                type: 'nouvelle_candidature',
                message: 'Nouvelle candidature recue'
            });
            await Notification.create({
                destinataire: user._id,
                type: 'candidature_acceptee',
                message: 'Votre candidature a ete acceptee',
                lue: true
            });

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.notifications).toHaveLength(2);
            expect(res.body.nonLues).toBe(1);
        });

        it('Doit retourner une liste vide si aucune notification', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.notifications).toHaveLength(0);
            expect(res.body.nonLues).toBe(0);
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .get('/api/notifications');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PATCH /api/notifications/:id/lue', () => {

        it('Doit marquer une notification comme lue', async () => {
            const notif = await Notification.create({
                destinataire: user._id,
                type: 'nouvelle_candidature',
                message: 'Test notification'
            });

            const res = await request(app)
                .patch(`/api/notifications/${notif._id}/lue`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.lue).toBe(true);
        });

        it('Doit refuser si la notification n\'appartient pas a l\'utilisateur', async () => {
            const autreUser = await Utilisateur.create({
                nom: 'Autre',
                prenom: 'User',
                email: 'autre@test.com',
                password: 'hashedpassword',
                role: 'candidat',
                isApproved: 'approved'
            });

            const notif = await Notification.create({
                destinataire: autreUser._id,
                type: 'nouvelle_candidature',
                message: 'Test notification'
            });

            const res = await request(app)
                .patch(`/api/notifications/${notif._id}/lue`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(404);
        });

        it('Doit refuser sans authentification', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/notifications/${fakeId}/lue`);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PATCH /api/notifications/lire-tout', () => {

        it('Doit marquer toutes les notifications comme lues', async () => {
            await Notification.create({
                destinataire: user._id,
                type: 'nouvelle_candidature',
                message: 'Notif 1'
            });
            await Notification.create({
                destinataire: user._id,
                type: 'candidature_acceptee',
                message: 'Notif 2'
            });

            const res = await request(app)
                .patch('/api/notifications/lire-tout')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);

            const nonLues = await Notification.countDocuments({ destinataire: user._id, lue: false });
            expect(nonLues).toBe(0);
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .patch('/api/notifications/lire-tout');

            expect(res.statusCode).toBe(401);
        });
    });
});

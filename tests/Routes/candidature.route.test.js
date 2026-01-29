const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require('../../models/utilisateur');
const Candidature = require('../../models/Candidature');

let candidat;
let candidatToken;
let entrepriseUser;
let entrepriseToken;
let entreprise;
let offre;

const setupTestData = async () => {
    // Creer un candidat
    candidat = await Utilisateur.create({
        nom: 'Candidat',
        prenom: 'Test',
        email: 'candidat@test.com',
        password: 'hashedpassword',
        role: 'candidat',
        isApproved: 'approved'
    });
    candidatToken = jwt.sign({ id: candidat._id }, process.env.JWT_SECRET || 'test-secret');

    // Creer une entreprise
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

    // Creer une offre active
    offre = await Offre.create({
        entreprise: entreprise._id,
        createdBy: entrepriseUser._id,
        titre: 'Developpeur Web Junior',
        description: 'Offre de test',
        lieu: 'Paris',
        statut: 'active'
    });
};

describe('Candidature API', () => {

    beforeEach(async () => {
        await setupTestData();
    });

    describe('POST /api/offres/:id/candidater', () => {

        it('Doit permettre a un candidat de postuler a une offre', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/candidater`)
                .set('Authorization', `Bearer ${candidatToken}`)
                .send({ message: 'Je suis tres motive pour ce poste' });

            expect(res.statusCode).toBe(201);
            expect(res.body.msg).toBe('Candidature envoyee avec succes');
            expect(res.body.candidature).toBeDefined();
            expect(res.body.candidature.message).toBe('Je suis tres motive pour ce poste');
        });

        it('Doit permettre de postuler sans message', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/candidater`)
                .set('Authorization', `Bearer ${candidatToken}`)
                .send({});

            expect(res.statusCode).toBe(201);
            expect(res.body.candidature.message).toBe('');
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/candidater`)
                .send({ message: 'Test' });

            expect(res.statusCode).toBe(401);
        });

        it('Doit refuser si l\'utilisateur est une entreprise', async () => {
            const res = await request(app)
                .post(`/api/offres/${offre._id}/candidater`)
                .set('Authorization', `Bearer ${entrepriseToken}`)
                .send({ message: 'Test' });

            expect(res.statusCode).toBe(403);
            expect(res.body.msg).toBe('Seuls les candidats peuvent postuler aux offres');
        });

        it('Doit refuser si l\'offre n\'existe pas', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/offres/${fakeId}/candidater`)
                .set('Authorization', `Bearer ${candidatToken}`)
                .send({ message: 'Test' });

            expect(res.statusCode).toBe(404);
            expect(res.body.msg).toBe('Offre non trouvee');
        });

        it('Doit refuser si l\'offre n\'est pas active', async () => {
            const offreFermee = await Offre.create({
                entreprise: entreprise._id,
                createdBy: entrepriseUser._id,
                titre: 'Offre fermee',
                description: 'Test',
                lieu: 'Lyon',
                statut: 'fermee'
            });

            const res = await request(app)
                .post(`/api/offres/${offreFermee._id}/candidater`)
                .set('Authorization', `Bearer ${candidatToken}`)
                .send({ message: 'Test' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toBe('Cette offre n\'est plus disponible');
        });

        it('Doit refuser une double candidature', async () => {
            // Premiere candidature
            await request(app)
                .post(`/api/offres/${offre._id}/candidater`)
                .set('Authorization', `Bearer ${candidatToken}`)
                .send({ message: 'Premiere candidature' });

            // Deuxieme candidature
            const res = await request(app)
                .post(`/api/offres/${offre._id}/candidater`)
                .set('Authorization', `Bearer ${candidatToken}`)
                .send({ message: 'Deuxieme candidature' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toBe('Vous avez deja postule a cette offre');
        });
    });

    describe('GET /api/offres/mes-candidatures', () => {

        it('Doit retourner les candidatures du candidat connecte', async () => {
            // Creer une candidature
            await Candidature.create({
                offre: offre._id,
                candidat: candidat._id,
                message: 'Ma candidature'
            });

            const res = await request(app)
                .get('/api/offres/mes-candidatures')
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.candidatures).toBeDefined();
            expect(res.body.candidatures.length).toBe(1);
        });

        it('Doit retourner une liste vide si aucune candidature', async () => {
            const res = await request(app)
                .get('/api/offres/mes-candidatures')
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.candidatures).toHaveLength(0);
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .get('/api/offres/mes-candidatures');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/offres/:id/candidatures', () => {

        it('Doit retourner les candidatures d\'une offre pour l\'entreprise', async () => {
            // Creer des candidatures
            await Candidature.create({
                offre: offre._id,
                candidat: candidat._id,
                message: 'Candidature 1'
            });

            const res = await request(app)
                .get(`/api/offres/${offre._id}/candidatures`)
                .set('Authorization', `Bearer ${entrepriseToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.candidatures).toBeDefined();
            expect(res.body.candidatures.length).toBe(1);
        });

        it('Doit refuser l\'acces a un non-proprietaire de l\'offre', async () => {
            // Creer un autre utilisateur entreprise
            const autreUser = await Utilisateur.create({
                nom: 'Autre',
                prenom: 'User',
                email: 'autre@test.com',
                password: 'hashedpassword',
                role: 'entreprise',
                isApproved: 'approved'
            });
            const autreToken = jwt.sign({ id: autreUser._id }, process.env.JWT_SECRET || 'test-secret');

            const res = await request(app)
                .get(`/api/offres/${offre._id}/candidatures`)
                .set('Authorization', `Bearer ${autreToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.msg).toBe('Non autorise');
        });

        it('Doit refuser sans authentification', async () => {
            const res = await request(app)
                .get(`/api/offres/${offre._id}/candidatures`);

            expect(res.statusCode).toBe(401);
        });
    });
});

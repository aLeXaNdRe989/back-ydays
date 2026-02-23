const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Utilisateur = require('../../models/utilisateur');
const Entreprise = require('../../models/entreprise');

describe('Tests Auth Routes - Inscription Entreprise', () => {

    beforeAll(async () => {
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();
    });

    beforeEach(async () => {
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();
    });

    // ===== TESTS REGISTER ENTREPRISE =====
    describe('POST /api/auth/register-entreprise', () => {
        it('devrait inscrire une entreprise avec statut pending', async () => {
            const res = await request(app)
                .post('/api/auth/register-entreprise')
                .send({
                    nom: 'Dupont',
                    prenom: 'Jean',
                    email: 'jean.dupont@test.com',
                    password: 'password123',
                    telephone: '0612345678',
                    entrepriseNom: 'Ma Startup',
                    entrepriseDescription: 'Une super startup',
                    entrepriseAdresse: '123 rue des tests',
                    entrepriseEmail: 'contact@mastartup.com'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('utilisateur');
            expect(res.body).toHaveProperty('entreprise');
            expect(res.body.utilisateur.isApproved).toBe('pending');
            expect(res.body.entreprise.isApproved).toBe('pending');
            expect(res.body.utilisateur.role).toBe('entreprise');
        });

        it('devrait refuser si l\'email utilisateur existe deja', async () => {
            // Creer un utilisateur existant
            await Utilisateur.create({
                nom: 'Existant',
                prenom: 'User',
                email: 'existant@test.com',
                password: 'hashedpassword'
            });

            const res = await request(app)
                .post('/api/auth/register-entreprise')
                .send({
                    nom: 'Nouveau',
                    prenom: 'User',
                    email: 'existant@test.com',
                    password: 'password123',
                    entrepriseNom: 'Entreprise',
                    entrepriseEmail: 'contact@entreprise.com'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toMatch(/email.*utilis/i);
        });

        it('devrait refuser si l\'email entreprise existe deja', async () => {
            // Creer un utilisateur pour l'entreprise existante
            const existingUser = await Utilisateur.create({
                nom: 'Owner',
                prenom: 'Existing',
                email: 'owner@test.com',
                password: 'hashedpassword'
            });

            // Creer une entreprise existante
            await Entreprise.create({
                nom: 'Entreprise Existante',
                email: 'contact@existante.com',
                createdBy: existingUser._id
            });

            const res = await request(app)
                .post('/api/auth/register-entreprise')
                .send({
                    nom: 'Nouveau',
                    prenom: 'User',
                    email: 'nouveau@test.com',
                    password: 'password123',
                    entrepriseNom: 'Nouvelle Entreprise',
                    entrepriseEmail: 'contact@existante.com'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toMatch(/email.*entreprise.*utilis/i);
        });

        it('devrait creer l\'utilisateur et l\'entreprise associee', async () => {
            const res = await request(app)
                .post('/api/auth/register-entreprise')
                .send({
                    nom: 'Martin',
                    prenom: 'Sophie',
                    email: 'sophie.martin@test.com',
                    password: 'password123',
                    entrepriseNom: 'Tech Corp',
                    entrepriseEmail: 'contact@techcorp.com'
                });

            expect(res.statusCode).toBe(201);

            // Verifier en base
            const user = await Utilisateur.findOne({ email: 'sophie.martin@test.com' });
            expect(user).not.toBeNull();
            expect(user.role).toBe('entreprise');
            expect(user.isApproved).toBe('pending');

            const entreprise = await Entreprise.findOne({ email: 'contact@techcorp.com' });
            expect(entreprise).not.toBeNull();
            expect(entreprise.createdBy.toString()).toBe(user._id.toString());
            expect(entreprise.isApproved).toBe('pending');
        });
    });

    // ===== TESTS FORGOT PASSWORD =====
    describe('POST /api/auth/forgot-password', () => {
        it('devrait generer un token de reinitialisation', async () => {
            await request(app).post('/api/auth/register').send({
                nom: 'Reset', prenom: 'User', email: 'reset@test.com', password: 'password123'
            });

            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'reset@test.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('resetToken');
            expect(res.body.expiresIn).toBe('30 minutes');
        });

        it('devrait retourner 404 si email inconnu', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'inconnu@test.com' });

            expect(res.statusCode).toBe(404);
        });

        it('devrait retourner 400 si email manquant', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });

    // ===== TESTS RESET PASSWORD =====
    describe('POST /api/auth/reset-password', () => {
        let resetToken;

        beforeEach(async () => {
            await request(app).post('/api/auth/register').send({
                nom: 'Reset', prenom: 'User', email: 'reset@test.com', password: 'oldpassword'
            });
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'reset@test.com' });
            resetToken = res.body.resetToken;
        });

        it('devrait reinitialiser le mot de passe avec un token valide', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: resetToken, newPassword: 'newpassword123' });

            expect(res.statusCode).toBe(200);
            expect(res.body.msg).toMatch(/réinitialisé/);

            // Verifier que le nouveau mot de passe fonctionne
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'reset@test.com', password: 'newpassword123' });
            expect(loginRes.statusCode).toBe(200);
        });

        it('devrait refuser un lien deja utilise', async () => {
            // Premier usage : OK
            await request(app)
                .post('/api/auth/reset-password')
                .send({ token: resetToken, newPassword: 'newpassword123' });

            // Deuxieme usage : refuse
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: resetToken, newPassword: 'autrepassword' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toMatch(/déjà été utilisé/);
        });

        it('devrait refuser un lien expire', async () => {
            // Forcer l'expiration du token en base
            await Utilisateur.updateOne(
                { email: 'reset@test.com' },
                { resetTokenExpires: new Date(Date.now() - 1000) }
            );

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: resetToken, newPassword: 'newpassword123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toMatch(/expiré/);
        });

        it('devrait refuser un token invalide', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: 'tokenbidon', newPassword: 'newpassword123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toMatch(/invalide/);
        });

        it('devrait refuser un mot de passe trop court', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: resetToken, newPassword: '123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.msg).toMatch(/10 caractères/);
        });
    });

    // ===== TESTS LOGIN AVEC isApproved =====
    describe('POST /api/auth/login - retour isApproved', () => {
        it('devrait retourner isApproved dans la reponse login', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    nom: 'Test',
                    prenom: 'User',
                    email: 'test@login.com',
                    password: 'password123',
                    role: 'candidat'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@login.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.utilisateur).toHaveProperty('isApproved');
        });

        it('devrait retourner approved pour un candidat inscrit normalement', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    nom: 'Candidat',
                    prenom: 'Normal',
                    email: 'candidat@normal.com',
                    password: 'password123',
                    role: 'candidat'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'candidat@normal.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.utilisateur.isApproved).toBe('approved');
        });
    });
});

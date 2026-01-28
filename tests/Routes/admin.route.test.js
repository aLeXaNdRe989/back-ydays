const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Utilisateur = require('../../models/utilisateur');
const Entreprise = require('../../models/entreprise');
const Offre = require('../../models/offre');

let adminToken;
let entrepriseToken;
let candidatToken;
let adminId;
let entrepriseUserId;
let candidatId;
let entrepriseId;

describe('Tests Admin Routes', () => {

    beforeAll(async () => {
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();
        await Offre.deleteMany();
    });

    beforeEach(async () => {
        await Utilisateur.deleteMany();
        await Entreprise.deleteMany();
        await Offre.deleteMany();

        // Creer un admin
        await request(app).post('/api/auth/register').send({
            nom: 'Admin',
            prenom: 'Super',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        // Creer un utilisateur entreprise (pending)
        const entrepriseUser = await Utilisateur.create({
            nom: 'Entreprise',
            prenom: 'User',
            email: 'entreprise@test.com',
            password: '$2b$10$hashedpassword',
            role: 'entreprise',
            isApproved: 'pending'
        });
        entrepriseUserId = entrepriseUser._id;

        // Creer un candidat (approved par defaut)
        await request(app).post('/api/auth/register').send({
            nom: 'Candidat',
            prenom: 'Test',
            email: 'candidat@test.com',
            password: 'password123',
            role: 'candidat'
        });

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });
        adminToken = loginAdmin.body.token;
        adminId = loginAdmin.body.utilisateur._id;

        // Login candidat
        const loginCandidat = await request(app)
            .post('/api/auth/login')
            .send({ email: 'candidat@test.com', password: 'password123' });
        candidatToken = loginCandidat.body.token;
        candidatId = loginCandidat.body.utilisateur._id;

        // Creer une entreprise
        const entreprise = await Entreprise.create({
            nom: 'Test Entreprise',
            email: 'contact@entreprise.com',
            createdBy: entrepriseUserId,
            isApproved: 'pending'
        });
        entrepriseId = entreprise._id;
    });

    // ===== TESTS DASHBOARD =====
    describe('GET /api/admin/dashboard', () => {
        it('devrait retourner les statistiques pour un admin', async () => {
            const res = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('totalUsers');
            expect(res.body).toHaveProperty('pendingUsers');
            expect(res.body).toHaveProperty('totalEntreprises');
            expect(res.body).toHaveProperty('pendingEntreprises');
            expect(res.body).toHaveProperty('totalOffres');
        });

        it('devrait compter separement les candidats et les entreprises en attente', async () => {
            // Creer un candidat en attente
            await Utilisateur.create({
                nom: 'Candidat',
                prenom: 'Pending',
                email: 'candidat.pending@test.com',
                password: 'hashedpassword',
                role: 'candidat',
                isApproved: 'pending'
            });

            const res = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            // pendingUsers ne doit compter que les candidats, pas les utilisateurs entreprise
            expect(res.body.pendingUsers).toBe(1); // seulement le candidat pending
            expect(res.body.pendingEntreprises).toBe(1); // l'entreprise pending
            // totalUsers ne compte que les candidats
            expect(res.body.totalUsers).toBe(2); // candidat approved + candidat pending
        });

        it('devrait refuser l\'acces a un non-admin', async () => {
            const res = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${candidatToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('devrait refuser l\'acces sans token', async () => {
            const res = await request(app)
                .get('/api/admin/dashboard');

            expect(res.statusCode).toBe(401);
        });
    });

    // ===== TESTS USERS =====
    describe('GET /api/admin/users', () => {
        it('devrait retourner la liste des utilisateurs', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('users');
            expect(res.body).toHaveProperty('pagination');
            expect(Array.isArray(res.body.users)).toBe(true);
        });

        it('devrait filtrer par statut pending', async () => {
            const res = await request(app)
                .get('/api/admin/users?status=pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            res.body.users.forEach(user => {
                expect(user.isApproved).toBe('pending');
            });
        });

        it('devrait filtrer par role', async () => {
            const res = await request(app)
                .get('/api/admin/users?role=candidat')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            res.body.users.forEach(user => {
                expect(user.role).toBe('candidat');
            });
        });
    });

    describe('PATCH /api/admin/users/:id/approval', () => {
        it('devrait approuver un utilisateur', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${entrepriseUserId}/approval`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isApproved: 'approved' });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.isApproved).toBe('approved');
        });

        it('devrait rejeter un utilisateur avec un motif', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${entrepriseUserId}/approval`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    isApproved: 'rejected',
                    rejectionReason: 'Documents incomplets'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.isApproved).toBe('rejected');
            expect(res.body.user.rejectionReason).toBe('Documents incomplets');
        });

        it('devrait refuser un statut invalide', async () => {
            const res = await request(app)
                .patch(`/api/admin/users/${entrepriseUserId}/approval`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isApproved: 'invalid_status' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('devrait supprimer un utilisateur', async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${candidatId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/supprim/i);

            const deleted = await Utilisateur.findById(candidatId);
            expect(deleted).toBeNull();
        });

        it('devrait refuser de supprimer un admin', async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${adminId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    // ===== TESTS ENTREPRISES =====
    describe('GET /api/admin/entreprises', () => {
        it('devrait retourner la liste des entreprises', async () => {
            const res = await request(app)
                .get('/api/admin/entreprises')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('entreprises');
            expect(Array.isArray(res.body.entreprises)).toBe(true);
        });

        it('devrait filtrer par statut', async () => {
            const res = await request(app)
                .get('/api/admin/entreprises?status=pending')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            res.body.entreprises.forEach(e => {
                expect(e.isApproved).toBe('pending');
            });
        });
    });

    describe('PATCH /api/admin/entreprises/:id/approval', () => {
        it('devrait approuver une entreprise et son utilisateur associe', async () => {
            const res = await request(app)
                .patch(`/api/admin/entreprises/${entrepriseId}/approval`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isApproved: 'approved' });

            expect(res.statusCode).toBe(200);
            expect(res.body.entreprise.isApproved).toBe('approved');

            // Verifier que l'utilisateur associe est aussi approuve
            const user = await Utilisateur.findById(entrepriseUserId);
            expect(user.isApproved).toBe('approved');
        });

        it('devrait rejeter une entreprise avec un motif', async () => {
            const res = await request(app)
                .patch(`/api/admin/entreprises/${entrepriseId}/approval`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    isApproved: 'rejected',
                    rejectionReason: 'Entreprise non verifiee'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.entreprise.isApproved).toBe('rejected');
        });
    });

    describe('DELETE /api/admin/entreprises/:id', () => {
        it('devrait supprimer une entreprise et ses offres', async () => {
            // Creer une offre liee a l'entreprise
            await Offre.create({
                titre: 'Test Offre',
                entreprise: entrepriseId
            });

            const res = await request(app)
                .delete(`/api/admin/entreprises/${entrepriseId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const deletedEntreprise = await Entreprise.findById(entrepriseId);
            expect(deletedEntreprise).toBeNull();

            const offres = await Offre.find({ entreprise: entrepriseId });
            expect(offres.length).toBe(0);
        });
    });

    // ===== TESTS OFFRES =====
    describe('GET /api/admin/offres', () => {
        it('devrait retourner la liste des offres', async () => {
            await Offre.create({
                titre: 'Offre 1',
                entreprise: entrepriseId
            });

            const res = await request(app)
                .get('/api/admin/offres')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('offres');
            expect(Array.isArray(res.body.offres)).toBe(true);
        });
    });

    describe('DELETE /api/admin/offres/:id', () => {
        it('devrait supprimer une offre', async () => {
            const offre = await Offre.create({
                titre: 'Offre a supprimer',
                entreprise: entrepriseId
            });

            const res = await request(app)
                .delete(`/api/admin/offres/${offre._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            const deleted = await Offre.findById(offre._id);
            expect(deleted).toBeNull();
        });
    });
});

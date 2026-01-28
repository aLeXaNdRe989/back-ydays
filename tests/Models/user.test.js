const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Utilisateur = require('../../models/utilisateur.js');

describe('Utilisateur Model Test', () => {
    it('Création d\'un utilisateur valide', async () => {
        const utilisateur = new Utilisateur({
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
            telephone: '0123456789',
            password: 'motdepassehashé'
        });

        const savedutilisateur = await utilisateur.save();

        expect(savedutilisateur._id).toBeDefined();
        expect(savedutilisateur.email).toBe('john.doe@example.com');
    });

    it('Ne doit pas sauvegarder sans email', async () => {
        const utilisateurSansEmail = new Utilisateur({
            nom: 'Test',
            prenom: 'SansEmail',
            password: 'motdepassehashé'
        });

        let err;
        try {
            await utilisateurSansEmail.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });

    // ===== TESTS isApproved =====
    it('devrait avoir isApproved par defaut a approved', async () => {
        const utilisateur = new Utilisateur({
            nom: 'Default',
            prenom: 'Approved',
            email: 'default@approved.com',
            password: 'motdepassehashé'
        });

        const saved = await utilisateur.save();

        expect(saved.isApproved).toBe('approved');
    });

    it('devrait accepter les valeurs pending, approved, rejected pour isApproved', async () => {
        const pendingUser = await Utilisateur.create({
            nom: 'Pending',
            prenom: 'User',
            email: 'pending@test.com',
            password: 'motdepassehashé',
            isApproved: 'pending'
        });
        expect(pendingUser.isApproved).toBe('pending');

        const approvedUser = await Utilisateur.create({
            nom: 'Approved',
            prenom: 'User',
            email: 'approved@test.com',
            password: 'motdepassehashé',
            isApproved: 'approved'
        });
        expect(approvedUser.isApproved).toBe('approved');

        const rejectedUser = await Utilisateur.create({
            nom: 'Rejected',
            prenom: 'User',
            email: 'rejected@test.com',
            password: 'motdepassehashé',
            isApproved: 'rejected'
        });
        expect(rejectedUser.isApproved).toBe('rejected');
    });

    it('devrait refuser une valeur invalide pour isApproved', async () => {
        const utilisateur = new Utilisateur({
            nom: 'Invalid',
            prenom: 'Status',
            email: 'invalid@status.com',
            password: 'motdepassehashé',
            isApproved: 'invalid_status'
        });

        let err;
        try {
            await utilisateur.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.isApproved).toBeDefined();
    });

    it('devrait pouvoir stocker un rejectionReason', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Rejected',
            prenom: 'WithReason',
            email: 'rejected@reason.com',
            password: 'motdepassehashé',
            isApproved: 'rejected',
            rejectionReason: 'Documents non conformes'
        });

        expect(utilisateur.rejectionReason).toBe('Documents non conformes');
    });
});

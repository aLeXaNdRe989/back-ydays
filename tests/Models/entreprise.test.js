require('dotenv').config({ path: '.env.test' });

const mongoose = require('mongoose');
const app = require('../../app');
const Entreprise = require('../../models/entreprise');
const Utilisateur = require('../../models/utilisateur');

let CreatedBy;

describe('Entreprise Model Test (Atlas)', () => {

    beforeAll(async () => {
        const EntrepriseOwner = await Utilisateur.create({
            nom: 'Test',
            prenom: 'User',
            email: 'user@test.com',
            password: 'hashedpassword'
        });
        CreatedBy = EntrepriseOwner._id;
    });

    it('Création d\'une entreprise valide', async () => {
        const validEntreprise = new Entreprise({
            nom: 'Test Entreprise',
            description: 'Description test',
            adresse: '123 rue des tests',
            email: 'test@entreprise.com',
            logo: 'http://image.com/logo.png',
            createdBy: CreatedBy
        });

        const savedEntreprise = await validEntreprise.save();

        expect(savedEntreprise._id).toBeDefined();
        expect(savedEntreprise.nom).toBe('Test Entreprise');
        expect(savedEntreprise.email).toBe('test@entreprise.com');
    });

    it('Ne doit pas sauvegarder une entreprise sans email', async () => {
        const entrepriseSansEmail = new Entreprise({
            nom: 'Entreprise sans email',
            description: 'Pas d\'email',
            createdBy: CreatedBy
        });

        let err;
        try {
            await entrepriseSansEmail.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });

    // ===== TESTS isApproved =====
    it('devrait avoir isApproved par defaut a pending', async () => {
        const entreprise = new Entreprise({
            nom: 'Default Entreprise',
            email: 'default@entreprise.com',
            createdBy: CreatedBy
        });

        const saved = await entreprise.save();

        expect(saved.isApproved).toBe('pending');
    });

    it('devrait accepter les valeurs pending, approved, rejected pour isApproved', async () => {
        const pendingEntreprise = await Entreprise.create({
            nom: 'Pending Entreprise',
            email: 'pending@entreprise.com',
            createdBy: CreatedBy,
            isApproved: 'pending'
        });
        expect(pendingEntreprise.isApproved).toBe('pending');

        const approvedEntreprise = await Entreprise.create({
            nom: 'Approved Entreprise',
            email: 'approved@entreprise.com',
            createdBy: CreatedBy,
            isApproved: 'approved'
        });
        expect(approvedEntreprise.isApproved).toBe('approved');

        const rejectedEntreprise = await Entreprise.create({
            nom: 'Rejected Entreprise',
            email: 'rejected@entreprise.com',
            createdBy: CreatedBy,
            isApproved: 'rejected'
        });
        expect(rejectedEntreprise.isApproved).toBe('rejected');
    });

    it('devrait refuser une valeur invalide pour isApproved', async () => {
        const entreprise = new Entreprise({
            nom: 'Invalid Status',
            email: 'invalid@status.com',
            createdBy: CreatedBy,
            isApproved: 'invalid_status'
        });

        let err;
        try {
            await entreprise.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.isApproved).toBeDefined();
    });

    it('devrait pouvoir stocker un rejectionReason', async () => {
        const entreprise = await Entreprise.create({
            nom: 'Rejected Entreprise',
            email: 'rejected@reason.com',
            createdBy: CreatedBy,
            isApproved: 'rejected',
            rejectionReason: 'Entreprise non verifiee'
        });

        expect(entreprise.rejectionReason).toBe('Entreprise non verifiee');
    });
});

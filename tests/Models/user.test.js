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
});

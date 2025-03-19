const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Utilisateur = require('../models/User.js');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Utilisateur Model Test', () => {
    it('Création d\'un utilisateur valide', async () => {
        const user = new Utilisateur({
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
            telephone: '0123456789',
            password: 'motdepassehashé'
        });

        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe('john.doe@example.com');
    });

    it('Ne doit pas sauvegarder sans email', async () => {
        const userSansEmail = new Utilisateur({
            nom: 'Test',
            prenom: 'SansEmail',
            password: 'motdepassehashé'
        });

        let err;
        try {
            await userSansEmail.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });
});

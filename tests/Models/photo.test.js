const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Photo = require('../../models/photo');

describe('Photo Model Test', () => {
    it('Crée une photo valide', async () => {
        const photo = new Photo({
            photo: 'https://cdn.exemple.com/image.png',
            table: 'entreprise'
        });

        const savedPhoto = await photo.save();

        expect(savedPhoto._id).toBeDefined();
        expect(savedPhoto.table).toBe('entreprise');
    });

    it('Doit refutilisateur une photo sans table', async () => {
        const photo = new Photo({ photo: 'https://cdn.exemple.com/image.png' });

        let err;
        try {
            await photo.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.table).toBeDefined();
    });
});

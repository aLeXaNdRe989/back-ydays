const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Signalement = require('../../models/signalement');

describe('Signalement Model Test', () => {
    it('Crée un signalement avec titre et description', async () => {
        const signalement = new Signalement({
            titre: 'Problème de stage',
            description: 'Problème rencontré lors du stage en entreprise'
        });

        const savedSignalement = await signalement.save();

        expect(savedSignalement.titre).toBe('Problème de stage');
        expect(savedSignalement.description).toContain('stage');
    });
});

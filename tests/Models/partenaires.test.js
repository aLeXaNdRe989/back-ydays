const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Partenaires = require('../../models/partenaires');

describe('Partenaires Model Test', () => {
    it('Crée un partenaire valide', async () => {
        const partenaire = new Partenaires({
            nom: 'Entreprise X',
            type: 'Entreprise'
        });

        const savedPartenaire = await partenaire.save();

        expect(savedPartenaire.nom).toBe('Entreprise X');
        expect(savedPartenaire.type).toBe('Entreprise');
    });
});

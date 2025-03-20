const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Etudiant = require('../../models/etudiant');
const Utilisateur = require('../../models/utilisateur');

describe('Etudiant Model Test', () => {
    it('Crée un étudiant lié à un utilisateur', async () => {
        const utilisateur = new Utilisateur({
            nom: 'Smith',
            prenom: 'Will',
            email: 'will.smith@school.com',
            telephone: '0123456789',
            password: 'hashedpassword'
        });

        const savedutilisateur = await utilisateur.save();

        const etudiant = new Etudiant({
            utilisateur: savedutilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const savedEtudiant = await etudiant.save();

        expect(savedEtudiant.utilisateur).toEqual(savedutilisateur._id);
        expect(savedEtudiant.dateDebut).toBeDefined();
    });
});

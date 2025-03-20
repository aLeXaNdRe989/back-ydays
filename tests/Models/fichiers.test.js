const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Fichiers = require('../../models/fichiers');
const Etudiant = require('../../models/etudiant');
const Utilisateur = require('../../models/utilisateur');

describe('Fichiers Model Test', () => {
    it('Crée un fichier lié à un étudiant', async () => {
        const utilisateur = new Utilisateur({
            nom: 'Test',
            prenom: 'Etudiant',
            email: 'etu@test.com',
            password: 'pass'
        });

        const savedutilisateur = await utilisateur.save();

        const etudiant = new Etudiant({
            utilisateur: savedutilisateur._id,
            dateDebut: new Date()
        });

        const savedEtudiant = await etudiant.save();

        const fichier = new Fichiers({
            etudiant: savedEtudiant._id,
            libelle: 'CV',
            fichier: 'http://docs.com/cv.pdf'
        });

        const savedFichier = await fichier.save();

        expect(savedFichier.libelle).toBe('CV');
        expect(savedFichier.fichier).toBe('http://docs.com/cv.pdf');
    });
});

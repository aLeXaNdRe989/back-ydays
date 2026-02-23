const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const Fichiers = require('../../models/fichiers');
const Etudiant = require('../../models/etudiant');
const Utilisateur = require('../../models/utilisateur');
const { getAuthToken } = require('../helpers/authHelper');

describe('Fichiers API', () => {
    let token;

    beforeEach(async () => {
        token = await getAuthToken();
    });

    it('POST /api/fichiers - doit créer un fichier', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Doe', prenom: 'John', email: 'john.doe@example.com', password: 'hashedpassword'
        });
        const etudiant = await Etudiant.create({ utilisateur: utilisateur._id, dateDebut: new Date('2024-01-01') });

        const res = await request(app)
            .post('/api/fichiers')
            .set('Authorization', `Bearer ${token}`)
            .send({ etudiant: etudiant._id, libelle: 'CV', fichier: 'http://fileserver.com/cv.pdf' });

        expect(res.statusCode).toBe(201);
        expect(res.body.libelle).toBe('CV');
        expect(res.body.fichier).toBe('http://fileserver.com/cv.pdf');
    });

    it('GET /api/fichiers - doit retourner une liste de fichiers', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Jane', prenom: 'Doe', email: 'jane.doe@example.com', password: 'hashedpassword'
        });
        const etudiant = await Etudiant.create({ utilisateur: utilisateur._id, dateDebut: new Date('2024-01-01') });
        await Fichiers.create({ etudiant: etudiant._id, libelle: 'Rapport', fichier: 'http://fileserver.com/rapport.pdf' });

        const res = await request(app).get('/api/fichiers');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('GET /api/fichiers/:id - doit retourner un fichier spécifique', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Tom', prenom: 'Hanks', email: 'tom.hanks@example.com', password: 'hashedpassword'
        });
        const etudiant = await Etudiant.create({ utilisateur: utilisateur._id, dateDebut: new Date('2024-01-01') });
        const fichier = await Fichiers.create({ etudiant: etudiant._id, libelle: 'Mémoire', fichier: 'http://fileserver.com/memoire.pdf' });

        const res = await request(app).get(`/api/fichiers/${fichier._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.libelle).toBe('Mémoire');
    });

    it('PUT /api/fichiers/:id - doit mettre à jour un fichier', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Lucas', prenom: 'Mendes', email: 'lucas.mendes@example.com', password: 'hashedpassword'
        });
        const etudiant = await Etudiant.create({ utilisateur: utilisateur._id, dateDebut: new Date('2024-01-01') });
        const fichier = await Fichiers.create({ etudiant: etudiant._id, libelle: 'Old Document', fichier: 'http://fileserver.com/old.pdf' });

        const res = await request(app)
            .put(`/api/fichiers/${fichier._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ libelle: 'New Document' });

        expect(res.statusCode).toBe(200);
        expect(res.body.libelle).toBe('New Document');
    });

    it('DELETE /api/fichiers/:id - doit supprimer un fichier', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Paul', prenom: 'Walker', email: 'paul.walker@example.com', password: 'hashedpassword'
        });
        const etudiant = await Etudiant.create({ utilisateur: utilisateur._id, dateDebut: new Date('2024-01-01') });
        const fichier = await Fichiers.create({ etudiant: etudiant._id, libelle: 'DocToDelete', fichier: 'http://fileserver.com/delete.pdf' });

        const res = await request(app)
            .delete(`/api/fichiers/${fichier._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Fichier supprimé');

        const deleted = await Fichiers.findById(fichier._id);
        expect(deleted).toBeNull();
    });
});

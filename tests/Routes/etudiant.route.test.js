const request = require('supertest');
const app = require('../../app');
const Etudiant = require('../../models/etudiant');
const Utilisateur = require('../../models/utilisateur');
const Ecole = require('../../models/ecole');
const Entreprise = require('../../models/entreprise');

describe('Etudiant API', () => {

    it('POST /api/etudiants - doit créer un étudiant', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Doe',
            prenom: 'John',
            email: 'john.doe@example.com',
            password: 'hashedpassword'
        });

        const EntrepriseOwner = await Utilisateur.create({
            nom: 'Test',
            prenom: 'User',
            email: 'user@test.com',
            password: 'hashedpassword'
        });

        const ecole = await Ecole.create({ nom: 'Ecole Dev' });
        const entreprise = await Entreprise.create({ nom: 'Entreprise Dev', email: 'dev@entreprise.com', createdBy: EntrepriseOwner._id });

        const res = await request(app)
            .post('/api/etudiants')
            .send({
                utilisateur: utilisateur._id,
                ecole: ecole._id,
                entreprise: entreprise._id,
                dateDebut: '2024-01-01',
                dateDiplome: '2025-06-30'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.utilisateur).toBe(String(utilisateur._id));
        expect(res.body.ecole).toBe(String(ecole._id));
    });

    it('GET /api/etudiants - doit retourner une liste d\'étudiants', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Test',
            prenom: 'utilisateur',
            email: 'test.utilisateur@example.com',
            password: 'hashedpassword'
        });

        await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const res = await request(app).get('/api/etudiants');

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it('GET /api/etudiants/:id - doit retourner un étudiant spécifique', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Jane',
            prenom: 'Doe',
            email: 'jane.doe@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const res = await request(app).get(`/api/etudiants/${etudiant._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.utilisateur._id).toBe(String(utilisateur._id));
    });

    it('PUT /api/etudiants/:id - doit mettre à jour un étudiant', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Update',
            prenom: 'utilisateur',
            email: 'update.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const res = await request(app)
            .put(`/api/etudiants/${etudiant._id}`)
            .send({ dateDiplome: '2025-06-30' });

        expect(res.statusCode).toBe(200);
        expect(res.body.dateDiplome).toContain('2025-06-30');
    });

    it('DELETE /api/etudiants/:id - doit supprimer un étudiant', async () => {
        const utilisateur = await Utilisateur.create({
            nom: 'Delete',
            prenom: 'utilisateur',
            email: 'delete.utilisateur@example.com',
            password: 'hashedpassword'
        });

        const etudiant = await Etudiant.create({
            utilisateur: utilisateur._id,
            dateDebut: new Date('2024-01-01')
        });

        const res = await request(app).delete(`/api/etudiants/${etudiant._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Etudiant supprimé');

        const deleted = await Etudiant.findById(etudiant._id);
        expect(deleted).toBeNull();
    });

});

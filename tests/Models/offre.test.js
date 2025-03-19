const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Offre = require('../../models/offre');
const Entreprise = require('../../models/entreprise');

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

describe('Offre Model Test', () => {
    it('Crée une offre valide avec une entreprise', async () => {
        // Crée une entreprise liée à l'offre
        const entreprise = new Entreprise({
            nom: 'InnovCorp',
            description: 'Entreprise d\'innovation',
            adresse: '123 rue des Startups',
            email: 'contact@innovcorp.com',
            logo: 'http://logo.com/innovcorp.png'
        });

        const savedEntreprise = await entreprise.save();

        // Crée l'offre en la liant à l'entreprise
        const offre = new Offre({
            entreprise: savedEntreprise._id,
            startDate: new Date('2024-05-01'),
            state: 1,
            experience: 3,
            degree: 5,
            description: 'Développeur Full Stack en alternance',
            contractType: 1, // CDI / CDD / Stage etc.
            salary: 35000.00
        });

        const savedOffre = await offre.save();

        expect(savedOffre._id).toBeDefined();
        expect(savedOffre.entreprise).toEqual(savedEntreprise._id);
        expect(savedOffre.description).toBe('Développeur Full Stack en alternance');
        expect(savedOffre.salary).toBe(35000.00);
    });

    it('Ne doit pas sauvegarder une offre sans entreprise', async () => {
        const offreSansEntreprise = new Offre({
            description: 'Offre sans entreprise',
            salary: 40000.00
        });

        let err;
        try {
            await offreSansEntreprise.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.entreprise).toBeDefined();
    });
});

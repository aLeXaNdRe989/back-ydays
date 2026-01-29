const mongoose = require('mongoose');
require('dotenv').config();

const Offre = require('../models/offre');

const MONGO_URI = process.env.MONGO_URI;

const offres = [
    {
        entreprise: '67db1190708a58c908e2a80b', // Dell
        createdBy: '697a8a6afc3a4231ab625733', // Admin
        titre: 'Developpeur Full Stack JavaScript',
        typeContrat: 'apprentissage',
        description: 'Rejoignez l\'equipe technique de Dell pour developper des applications web innovantes. Vous travaillerez sur des projets stimulants utilisant React, Node.js et les dernieres technologies cloud. Encadrement par des seniors passionnes.',
        profilRecherche: 'Etudiant en informatique (Bac+3 a Bac+5) avec des connaissances en JavaScript, HTML/CSS. Curiosite et envie d\'apprendre sont essentielles.',
        competences: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
        niveauEtudes: 'Bac+3 / Bac+4',
        duree: '12 mois',
        rythme: '3 semaines entreprise / 1 semaine ecole',
        dateDebut: new Date('2026-09-01'),
        dateLimite: new Date('2026-06-30'),
        remuneration: '1200 - 1500 euros/mois',
        teletravail: 'partiel',
        avantages: 'Tickets restaurant, mutuelle, teletravail 2j/semaine, materiel fourni',
        lieu: 'Paris',
        codePostal: '75008',
        statut: 'active'
    },
    {
        entreprise: '67db116e708a58c908e2a806', // Ynov Campus
        createdBy: '697a8a6afc3a4231ab625733', // Admin
        titre: 'Assistant Pedagogique Digital',
        typeContrat: 'apprentissage',
        description: 'Ynov Campus recherche un assistant pedagogique pour accompagner les etudiants dans leur parcours. Vous participerez a la creation de contenus e-learning, l\'animation de workshops et le suivi des apprenants.',
        profilRecherche: 'Etudiant en communication digitale ou informatique, a l\'aise avec les outils numeriques et le contact humain.',
        competences: ['Communication', 'Outils digitaux', 'Pedagogie', 'Organisation'],
        niveauEtudes: 'Bac+2 / Bac+3',
        duree: '24 mois',
        rythme: '1 semaine entreprise / 1 semaine ecole',
        dateDebut: new Date('2026-09-01'),
        dateLimite: new Date('2026-07-15'),
        remuneration: '900 - 1100 euros/mois',
        teletravail: 'partiel',
        avantages: 'Acces aux formations Ynov, environnement dynamique, events reguliers',
        lieu: 'Montpellier',
        codePostal: '34090',
        statut: 'active'
    },
    {
        entreprise: '697a8d138a49c76c9b02fded', // Alexandre Piron
        createdBy: '697a8a6afc3a4231ab625733', // Admin
        titre: 'Developpeur Mobile React Native',
        typeContrat: 'professionnalisation',
        description: 'Nous recherchons un developpeur mobile passionne pour creer des applications iOS et Android avec React Native. Vous serez implique dans tout le cycle de developpement, de la conception au deploiement.',
        profilRecherche: 'Etudiant en developpement mobile ou web avec une premiere experience en React ou React Native. Passion pour le mobile indispensable.',
        competences: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android'],
        niveauEtudes: 'Bac+4 / Bac+5',
        duree: '12 mois',
        rythme: '4 jours entreprise / 1 jour ecole',
        dateDebut: new Date('2026-10-01'),
        dateLimite: new Date('2026-08-31'),
        remuneration: '1300 - 1600 euros/mois',
        teletravail: 'oui',
        avantages: 'Full remote possible, horaires flexibles, formation continue',
        lieu: 'Montpellier',
        codePostal: '34000',
        statut: 'active'
    },
    {
        entreprise: '697a93148a49c76c9b02fe5e', // Test (Lyon)
        createdBy: '697a8a6afc3a4231ab625733', // Admin
        titre: 'Data Analyst Junior',
        typeContrat: 'apprentissage',
        description: 'Integrez notre equipe data pour analyser les donnees clients et contribuer a la prise de decision strategique. Vous utiliserez Python, SQL et des outils de visualisation pour transformer les donnees en insights actionnables.',
        profilRecherche: 'Etudiant en data science, statistiques ou informatique. Bases en Python et SQL appreciees. Esprit analytique et rigueur requis.',
        competences: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistiques'],
        niveauEtudes: 'Bac+3 / Bac+4',
        duree: '18 mois',
        rythme: '3 semaines entreprise / 1 semaine ecole',
        dateDebut: new Date('2026-09-15'),
        dateLimite: new Date('2026-07-31'),
        remuneration: '1100 - 1400 euros/mois',
        teletravail: 'partiel',
        avantages: 'Teletravail 1j/semaine, tickets restaurant, prime annuelle',
        lieu: 'Lyon',
        codePostal: '69003',
        statut: 'active'
    }
];

async function createOffres() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connecte');

        for (const offreData of offres) {
            const offre = new Offre(offreData);
            await offre.save();
            console.log(`Offre creee: ${offreData.titre}`);
        }

        console.log('\\n4 offres creees avec succes!');
        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
}

createOffres();

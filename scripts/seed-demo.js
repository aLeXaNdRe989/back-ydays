/**
 * Script de peuplement de la base de donnees pour la demo
 * Usage: node scripts/seed-demo.js
 * Pour reinitialiser: node scripts/seed-demo.js --reset
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');
const Offre = require('../models/offre');
const Candidature = require('../models/candidature');
const Diplome = require('../models/diplome');
const Ecole = require('../models/ecole');
const Evaluation = require('../models/evaluation');

const MONGO_URI = process.env.MONGO_URI;
const RESET = process.argv.includes('--reset');

async function hash(password) {
    return bcrypt.hash(password, 10);
}

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connecte');

        if (RESET) {
            console.log('\n--- REINITIALISATION ---');
            await Candidature.deleteMany({});
            await Offre.deleteMany({});
            await Evaluation.deleteMany({});
            await Entreprise.deleteMany({});
            await Ecole.deleteMany({});
            await Diplome.deleteMany({});
            await Utilisateur.deleteMany({});
            console.log('Collections videes');
        }

        // =========================
        // ADMIN
        // =========================
        console.log('\n=== Admin ===');
        let admin = await Utilisateur.findOne({ email: 'admin@alternwork.com' });
        if (admin) {
            console.log('Admin deja existant');
        } else {
            admin = await Utilisateur.create({
                nom: 'Admin',
                prenom: 'AlternWork',
                email: 'admin@alternwork.com',
                password: await hash('Admin123456'),
                role: 'admin',
                isApproved: 'approved'
            });
            console.log('Admin cree: admin@alternwork.com / Admin123456');
        }

        // =========================
        // DIPLOMES
        // =========================
        console.log('\n=== Diplomes ===');
        const diplomes = await Diplome.insertMany([
            { libelle: 'BTS SIO', description: 'Services Informatiques aux Organisations - Bac+2', niveau: 5 },
            { libelle: 'Bachelor Informatique', description: 'Formation Bac+3 en developpement web, mobile et bases de donnees.', niveau: 6 },
            { libelle: 'Master Expert Developpement', description: 'Bac+5 - Architecture logicielle, DevOps et management technique.', niveau: 7 },
            { libelle: 'Master Data Science & IA', description: 'Bac+5 - Analyse de donnees, machine learning et intelligence artificielle.', niveau: 7 }
        ]);
        console.log(`${diplomes.length} diplomes`);

        // =========================
        // ECOLES
        // =========================
        console.log('\n=== Ecoles ===');
        const ecoles = await Ecole.insertMany([
            { nom: 'Ynov Campus Montpellier', description: 'Ecole du numerique - formations Bac+1 a Bac+5 en informatique et digital.', diplome: diplomes[1]._id },
            { nom: 'Ynov Campus Paris', description: 'Campus parisien Ynov - formations en informatique et digital.', diplome: diplomes[2]._id },
            { nom: 'EPSI Montpellier', description: 'Ecole d\'ingenierie informatique du BTS au Master.', diplome: diplomes[2]._id },
            { nom: 'Universite de Montpellier', description: 'Faculte des Sciences - parcours data science.', diplome: diplomes[3]._id },
            { nom: 'IUT de Montpellier', description: 'Departement Informatique - formation professionnalisante.', diplome: diplomes[0]._id }
        ]);
        console.log(`${ecoles.length} ecoles`);

        // =========================
        // ENTREPRISES
        // =========================
        console.log('\n=== Entreprises ===');

        const entreprisesData = [
            {
                user: { nom: 'Dupont', prenom: 'Marie', email: 'contact@techsolutions.fr', telephone: '0467123456', password: 'Entreprise123' },
                ent: { nom: 'TechSolutions', description: 'ESN specialisee dans le developpement web et mobile. Accompagnement des startups et PME dans leur transformation digitale.', adresse: '15 Rue de la Loge, 34000 Montpellier', email: 'contact@techsolutions.fr', isApproved: 'approved' }
            },
            {
                user: { nom: 'Martin', prenom: 'Jean-Pierre', email: 'rh@innovdata.io', telephone: '0145678901', password: 'Entreprise123' },
                ent: { nom: 'InnovData', description: 'Cabinet de conseil et editeur de logiciels en data engineering et intelligence artificielle. 150 collaborateurs.', adresse: '42 Avenue des Champs-Elysees, 75008 Paris', email: 'rh@innovdata.io', isApproved: 'approved' }
            },
            {
                user: { nom: 'Garcia', prenom: 'Sophie', email: 'recrutement@greendev.eco', telephone: '0478901234', password: 'Entreprise123' },
                ent: { nom: 'GreenDev', description: 'Startup engagee dans la transition ecologique. Applications pour mesurer et reduire l\'empreinte carbone des entreprises.', adresse: '8 Place Bellecour, 69002 Lyon', email: 'recrutement@greendev.eco', isApproved: 'approved' }
            },
            {
                user: { nom: 'Leblanc', prenom: 'Thomas', email: 'jobs@cloudnine.fr', telephone: '0356789012', password: 'Entreprise123' },
                ent: { nom: 'CloudNine', description: 'Hebergeur cloud francais et editeur de solutions SaaS. Infrastructure souveraine certifiee SecNumCloud.', adresse: '22 Rue du Faubourg, 67000 Strasbourg', email: 'jobs@cloudnine.fr', isApproved: 'approved' }
            },
            {
                user: { nom: 'Petit', prenom: 'Laura', email: 'alternance@webagency34.com', telephone: '0499887766', password: 'Entreprise123' },
                ent: { nom: 'WebAgency34', description: 'Agence web creative. Sites vitrines, e-commerce et applications web pour des clients locaux et nationaux.', adresse: '5 Boulevard du Jeu de Paume, 34000 Montpellier', email: 'alternance@webagency34.com', isApproved: 'approved' }
            },
            {
                user: { nom: 'Nguyen', prenom: 'Linh', email: 'contact@fintechlab.fr', telephone: '0612345678', password: 'Entreprise123' },
                ent: { nom: 'FintechLab', description: 'Startup fintech specialisee dans les solutions de paiement innovantes.', adresse: '10 Rue de la Republique, 34000 Montpellier', email: 'contact@fintechlab.fr', isApproved: 'pending' }
            },
            {
                user: { nom: 'Roche', prenom: 'Fabien', email: 'fabien@cyberguard.fr', telephone: '0634567890', password: 'Entreprise123' },
                ent: { nom: 'CyberGuard', description: 'Cabinet de conseil en cybersecurite. Audits, pentests et formation pour les entreprises.', adresse: '18 Rue Foch, 31000 Toulouse', email: 'fabien@cyberguard.fr', isApproved: 'pending' }
            },
            {
                user: { nom: 'Chevalier', prenom: 'Audrey', email: 'audrey@smartlogistics.fr', telephone: '0645678901', password: 'Entreprise123' },
                ent: { nom: 'SmartLogistics', description: 'Editeur de logiciels de gestion logistique et supply chain pour les PME.', adresse: '3 Rue de la Gare, 33000 Bordeaux', email: 'audrey@smartlogistics.fr', isApproved: 'pending' }
            },
            {
                user: { nom: 'Faure', prenom: 'Damien', email: 'damien@edutechfr.com', telephone: '0656789012', password: 'Entreprise123' },
                ent: { nom: 'EduTech France', description: 'Plateforme e-learning pour les ecoles et universites. Contenus interactifs et suivi pedagogique.', adresse: '7 Avenue Jean Jaures, 34000 Montpellier', email: 'damien@edutechfr.com', isApproved: 'pending' }
            }
        ];

        const entreprises = [];
        const entUsers = [];

        for (const d of entreprisesData) {
            const user = await Utilisateur.create({
                ...d.user,
                password: await hash(d.user.password),
                role: 'entreprise',
                isApproved: d.ent.isApproved === 'approved' ? 'approved' : 'pending'
            });
            const ent = await Entreprise.create({ ...d.ent, createdBy: user._id });
            entreprises.push(ent);
            entUsers.push(user);
            console.log(`  ${d.ent.nom} (${d.ent.isApproved})`);
        }

        // =========================
        // CANDIDATS
        // =========================
        console.log('\n=== Candidats ===');

        const candidatsInfo = [
            { nom: 'Moreau', prenom: 'Lucas', email: 'lucas.moreau@email.com', telephone: '0612345001' },
            { nom: 'Bernard', prenom: 'Emma', email: 'emma.bernard@email.com', telephone: '0612345002' },
            { nom: 'Leroy', prenom: 'Hugo', email: 'hugo.leroy@email.com', telephone: '0612345003' },
            { nom: 'Robert', prenom: 'Chloe', email: 'chloe.robert@email.com', telephone: '0612345004' },
            { nom: 'Richard', prenom: 'Nathan', email: 'nathan.richard@email.com', telephone: '0612345005' },
            { nom: 'Durand', prenom: 'Lea', email: 'lea.durand@email.com', telephone: '0612345006' },
            { nom: 'Mercier', prenom: 'Maxime', email: 'maxime.mercier@email.com', telephone: '0612345007' },
            { nom: 'Bonnet', prenom: 'Julie', email: 'julie.bonnet@email.com', telephone: '0612345008' }
        ];

        const candidats = [];
        for (const c of candidatsInfo) {
            const user = await Utilisateur.create({
                ...c,
                password: await hash('Candidat123'),
                role: 'candidat',
                isApproved: 'approved'
            });
            candidats.push(user);
            console.log(`  ${c.prenom} ${c.nom}`);
        }

        // Candidats en attente
        const pendingCandidats = [
            { nom: 'Dubois', prenom: 'Antoine', email: 'antoine.dubois@email.com', telephone: '0612345009' },
            { nom: 'Girard', prenom: 'Camille', email: 'camille.girard@email.com', telephone: '0612345010' },
            { nom: 'Fournier', prenom: 'Theo', email: 'theo.fournier@email.com', telephone: '0612345011' },
            { nom: 'Morel', prenom: 'Sarah', email: 'sarah.morel@email.com', telephone: '0612345012' }
        ];
        for (const c of pendingCandidats) {
            await Utilisateur.create({
                ...c, password: await hash('Candidat123'), role: 'candidat', isApproved: 'pending'
            });
            console.log(`  ${c.prenom} ${c.nom} (pending)`);
        }

        // =========================
        // OFFRES
        // =========================
        console.log('\n=== Offres ===');

        const offres = await Offre.insertMany([
            // TechSolutions
            {
                entreprise: entreprises[0]._id, createdBy: entUsers[0]._id,
                titre: 'Developpeur Full Stack JavaScript', typeContrat: 'apprentissage',
                description: 'Rejoignez notre equipe pour developper des applications web avec React et Node.js. Projets clients varies : e-commerce, SaaS, applications metiers.',
                profilRecherche: 'Etudiant(e) en informatique Bac+3 a Bac+5 avec des connaissances en JavaScript.',
                competences: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-07-15'),
                remuneration: '1200 - 1500 euros/mois', teletravail: 'partiel',
                avantages: 'Tickets restaurant, mutuelle, teletravail 2j/semaine, MacBook Pro',
                lieu: 'Montpellier', codePostal: '34000', statut: 'active',
                diplome: diplomes[1]._id, ecole: ecoles[0]._id
            },
            {
                entreprise: entreprises[0]._id, createdBy: entUsers[0]._id,
                titre: 'Developpeur Frontend React', typeContrat: 'apprentissage',
                description: 'Alternant(e) frontend pour travailler sur nos interfaces utilisateurs. Composants React reutilisables et reviews de code.',
                profilRecherche: 'Etudiant(e) en developpement web avec une sensibilite UX/UI.',
                competences: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Git'],
                niveauEtudes: 'Bac+2 / Bac+3', duree: '24 mois', rythme: '1 semaine ecole / 3 semaines entreprise',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-08-01'),
                remuneration: '900 - 1200 euros/mois', teletravail: 'partiel',
                avantages: 'Tickets restaurant, mutuelle, ambiance startup',
                lieu: 'Montpellier', codePostal: '34000', statut: 'active',
                diplome: diplomes[0]._id, ecole: ecoles[0]._id
            },
            {
                entreprise: entreprises[0]._id, createdBy: entUsers[0]._id,
                titre: 'Developpeur Backend Node.js', typeContrat: 'apprentissage',
                description: 'Poste backend pour renforcer notre equipe sur les APIs et microservices Node.js.',
                profilRecherche: 'Etudiant(e) en informatique avec des bases en Node.js et bases de donnees.',
                competences: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-03-01'), dateLimite: new Date('2026-01-15'),
                remuneration: '1200 - 1400 euros/mois', teletravail: 'partiel',
                avantages: 'Tickets restaurant, mutuelle, materiel fourni',
                lieu: 'Montpellier', codePostal: '34000', statut: 'pourvue',
                diplome: diplomes[1]._id, ecole: ecoles[0]._id
            },
            // InnovData
            {
                entreprise: entreprises[1]._id, createdBy: entUsers[1]._id,
                titre: 'Data Engineer Junior', typeContrat: 'apprentissage',
                description: 'Integrez le pole data pour concevoir des pipelines de donnees. Technologies Big Data (Spark, Airflow, dbt) sur des projets grands comptes.',
                profilRecherche: 'Etudiant(e) en data engineering ou informatique avec des bases en Python et SQL.',
                competences: ['Python', 'SQL', 'Apache Spark', 'AWS', 'Docker'],
                niveauEtudes: 'Bac+4 / Bac+5', duree: '24 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-09-15'), dateLimite: new Date('2026-07-31'),
                remuneration: '1400 - 1700 euros/mois', teletravail: 'partiel',
                avantages: 'Tickets restaurant, RTT, prime annuelle, certifications cloud financees',
                lieu: 'Paris', codePostal: '75008', statut: 'active',
                diplome: diplomes[3]._id, ecole: ecoles[1]._id
            },
            {
                entreprise: entreprises[1]._id, createdBy: entUsers[1]._id,
                titre: 'Consultant Junior IA / Machine Learning', typeContrat: 'apprentissage',
                description: 'Missions de conseil en IA. Developpement de modeles ML, POC et presentations clients.',
                profilRecherche: 'Etudiant(e) en Master Data Science ou IA. Bases en maths, stats et Python.',
                competences: ['Python', 'TensorFlow', 'Scikit-learn', 'NLP', 'SQL'],
                niveauEtudes: 'Bac+4 / Bac+5', duree: '12 mois', rythme: '4 jours entreprise / 1 jour ecole',
                dateDebut: new Date('2026-10-01'), dateLimite: new Date('2026-08-15'),
                remuneration: '1500 - 1800 euros/mois', teletravail: 'partiel',
                avantages: 'Tickets restaurant, RTT, conferences tech, budget formation',
                lieu: 'Paris', codePostal: '75008', statut: 'active',
                diplome: diplomes[3]._id, ecole: ecoles[3]._id
            },
            {
                entreprise: entreprises[1]._id, createdBy: entUsers[1]._id,
                titre: 'Analyste Business Intelligence', typeContrat: 'professionnalisation',
                description: 'Rejoignez l\'equipe BI pour creer des dashboards et rapports strategiques avec Power BI et SQL.',
                profilRecherche: 'Etudiant(e) en informatique de gestion ou data analytics. Excel avance requis.',
                competences: ['Power BI', 'SQL', 'Excel', 'DAX', 'ETL'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-06-30'),
                remuneration: '1100 - 1400 euros/mois', teletravail: 'oui',
                avantages: 'Full remote possible, horaires flexibles, tickets restaurant',
                lieu: 'Paris', codePostal: '75008', statut: 'active'
            },
            {
                entreprise: entreprises[1]._id, createdBy: entUsers[1]._id,
                titre: 'Developpeur Python Automatisation', typeContrat: 'apprentissage',
                description: 'Scripts et outils d\'automatisation pour nos processus internes. Python, API REST, scripting avance.',
                profilRecherche: 'Etudiant(e) en informatique avec des bases solides en Python.',
                competences: ['Python', 'API REST', 'Selenium', 'Git', 'Linux'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-01-15'), dateLimite: new Date('2025-12-01'),
                remuneration: '1200 - 1500 euros/mois', teletravail: 'partiel',
                avantages: 'Tickets restaurant, RTT, ambiance conviviale',
                lieu: 'Paris', codePostal: '75008', statut: 'pourvue'
            },
            // GreenDev
            {
                entreprise: entreprises[2]._id, createdBy: entUsers[2]._id,
                titre: 'Developpeur Backend Python / Django', typeContrat: 'apprentissage',
                description: 'APIs de notre plateforme de bilan carbone. Python, Django REST Framework, PostgreSQL, Redis. CI/CD.',
                profilRecherche: 'Etudiant(e) en informatique avec des bases en Python. Sensibilite ecologique appreciee.',
                competences: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-07-15'),
                remuneration: '1100 - 1400 euros/mois', teletravail: 'partiel',
                avantages: 'Impact ecologique, teletravail 3j/semaine, velo de fonction',
                lieu: 'Lyon', codePostal: '69002', statut: 'active',
                diplome: diplomes[1]._id, ecole: ecoles[2]._id
            },
            {
                entreprise: entreprises[2]._id, createdBy: entUsers[2]._id,
                titre: 'Developpeur Mobile Flutter', typeContrat: 'professionnalisation',
                description: 'Application mobile eco-responsable avec Flutter. Suivi et reduction de l\'empreinte carbone au quotidien.',
                profilRecherche: 'Etudiant(e) en developpement mobile. Flutter ou React Native apprecie.',
                competences: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '4 jours entreprise / 1 jour ecole',
                dateDebut: new Date('2026-10-01'), dateLimite: new Date('2026-08-31'),
                remuneration: '1200 - 1500 euros/mois', teletravail: 'oui',
                avantages: 'Full remote, impact positif, equipe jeune',
                lieu: 'Lyon', codePostal: '69002', statut: 'active'
            },
            {
                entreprise: entreprises[2]._id, createdBy: entUsers[2]._id,
                titre: 'Stagiaire QA / Testeur', typeContrat: 'professionnalisation',
                description: 'Test et assurance qualite sur notre plateforme. Plans de test, automatisation Cypress.',
                profilRecherche: 'Etudiant(e) rigoureux avec un interet pour la qualite logicielle.',
                competences: ['Cypress', 'Jest', 'Git', 'Jira', 'Agile'],
                niveauEtudes: 'Bac+2 / Bac+3', duree: '6 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2025-09-01'), dateLimite: new Date('2025-07-31'),
                remuneration: '900 - 1100 euros/mois', teletravail: 'non',
                avantages: 'Equipe bienveillante, methodologie agile',
                lieu: 'Lyon', codePostal: '69002', statut: 'fermee'
            },
            // CloudNine
            {
                entreprise: entreprises[3]._id, createdBy: entUsers[3]._id,
                titre: 'Administrateur Systemes & Cloud', typeContrat: 'apprentissage',
                description: 'Infrastructure cloud souveraine. Kubernetes, Terraform, monitoring. Automatisation et deploiement.',
                profilRecherche: 'Etudiant(e) en systemes et reseaux ou DevOps. Bases Linux indispensables.',
                competences: ['Linux', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '24 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-07-31'),
                remuneration: '1200 - 1500 euros/mois', teletravail: 'partiel',
                avantages: 'Certifications financees, materiel haut de gamme, teletravail 2j/semaine',
                lieu: 'Strasbourg', codePostal: '67000', statut: 'active',
                diplome: diplomes[2]._id, ecole: ecoles[2]._id
            },
            {
                entreprise: entreprises[3]._id, createdBy: entUsers[3]._id,
                titre: 'Ingenieur DevOps / SRE Junior', typeContrat: 'apprentissage',
                description: 'Equipe SRE : fiabilite et performance des services. Observabilite, automatisation, gestion des incidents.',
                profilRecherche: 'Etudiant(e) en informatique, interet pour l\'infra et le DevOps. Scripting Bash/Python apprecie.',
                competences: ['Python', 'Bash', 'Prometheus', 'Grafana', 'Ansible'],
                niveauEtudes: 'Bac+4 / Bac+5', duree: '12 mois', rythme: '4 jours entreprise / 1 jour ecole',
                dateDebut: new Date('2026-09-15'), dateLimite: new Date('2026-08-15'),
                remuneration: '1400 - 1700 euros/mois', teletravail: 'partiel',
                avantages: 'Astreintes remunerees, certifications, events tech internes',
                lieu: 'Strasbourg', codePostal: '67000', statut: 'active'
            },
            // WebAgency34
            {
                entreprise: entreprises[4]._id, createdBy: entUsers[4]._id,
                titre: 'Developpeur WordPress / PHP', typeContrat: 'apprentissage',
                description: 'Sites web pour nos clients (PME, artisans, commercants). Themes et plugins WordPress sur mesure.',
                profilRecherche: 'Etudiant(e) en dev web. PHP et HTML/CSS requis. Sens du design apprecie.',
                competences: ['PHP', 'WordPress', 'HTML/CSS', 'JavaScript', 'MySQL'],
                niveauEtudes: 'Bac+2 / Bac+3', duree: '12 mois', rythme: '1 semaine ecole / 3 semaines entreprise',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-07-31'),
                remuneration: '800 - 1100 euros/mois', teletravail: 'non',
                avantages: 'Contact client direct, projets varies, equipe a taille humaine',
                lieu: 'Montpellier', codePostal: '34000', statut: 'active',
                diplome: diplomes[0]._id, ecole: ecoles[4]._id
            },
            {
                entreprise: entreprises[4]._id, createdBy: entUsers[4]._id,
                titre: 'UX/UI Designer Junior', typeContrat: 'apprentissage',
                description: 'Maquettes et prototypes pour nos projets web. Audits UX, wireframes et maquettes Figma.',
                profilRecherche: 'Etudiant(e) en design digital. Portfolio obligatoire. Figma ou Sketch.',
                competences: ['Figma', 'UX Research', 'UI Design', 'Prototypage', 'Adobe Suite'],
                niveauEtudes: 'Bac+3 / Bac+4', duree: '12 mois', rythme: '3 semaines entreprise / 1 semaine ecole',
                dateDebut: new Date('2026-09-01'), dateLimite: new Date('2026-08-15'),
                remuneration: '1000 - 1300 euros/mois', teletravail: 'partiel',
                avantages: 'Projets creatifs, licence Adobe offerte, teletravail 1j/semaine',
                lieu: 'Montpellier', codePostal: '34000', statut: 'active',
                diplome: diplomes[1]._id
            }
        ]);
        console.log(`${offres.length} offres`);

        // =========================
        // CANDIDATURES
        // =========================
        console.log('\n=== Candidatures ===');

        const candidaturesData = [
            {
                offre: offres[0]._id, candidat: candidats[0]._id,
                message: 'Etudiant en 3e annee de Bachelor Informatique a Ynov, je suis passionne par le dev web. Plusieurs projets en React et Node.js. Motive pour rejoindre TechSolutions.',
                statut: 'acceptee', dateReponse: new Date('2026-02-10'),
                reponseEntreprise: 'Votre profil correspond parfaitement. Nous serions ravis de vous accueillir en septembre. Contactez-nous pour finaliser.'
            },
            {
                offre: offres[3]._id, candidat: candidats[0]._id,
                message: 'Passionne par la data, je veux orienter ma carriere vers le data engineering. Mes projets en Python et SQL m\'ont donne de bonnes bases.',
                statut: 'vue'
            },
            {
                offre: offres[1]._id, candidat: candidats[1]._id,
                message: 'En BTS SIO option SLAM, passionnee par le frontend et le design. Mon portfolio inclut plusieurs projets React avec Tailwind CSS.',
                statut: 'en_attente'
            },
            {
                offre: offres[13]._id, candidat: candidats[1]._id, // UX/UI Designer - WebAgency34
                message: 'Le design UX/UI est ma passion. Plusieurs maquettes Figma realisees. L\'aspect creatif de WebAgency34 m\'attire beaucoup.',
                statut: 'acceptee', dateReponse: new Date('2026-02-08'),
                reponseEntreprise: 'Votre portfolio nous a convaincus ! Nous vous proposons un entretien. A bientot !'
            },
            {
                offre: offres[7]._id, candidat: candidats[2]._id, // Dev Backend Python - GreenDev
                message: 'En Bachelor a EPSI, motive par le projet GreenDev. La transition ecologique me tient a coeur, j\'aimerais y contribuer par le code.',
                statut: 'en_attente'
            },
            {
                offre: offres[10]._id, candidat: candidats[2]._id, // Admin Systemes - CloudNine
                message: 'Passionne par l\'infra et le cloud. J\'administre un homelab depuis 2 ans (Proxmox, Docker, Nginx). CloudNine correspond a mon projet pro.',
                statut: 'refusee', dateReponse: new Date('2026-02-05'),
                reponseEntreprise: 'Merci pour votre candidature. Nous avons retenu un candidat avec plus d\'experience Kubernetes. N\'hesitez pas a repostuler.'
            },
            {
                offre: offres[4]._id, candidat: candidats[3]._id,
                message: 'En Master Data Science a l\'Universite de Montpellier. Projets en NLP et computer vision. Ravie de rejoindre l\'equipe IA d\'InnovData.',
                statut: 'vue'
            },
            {
                offre: offres[8]._id, candidat: candidats[4]._id,
                message: 'Dev mobile depuis 3 ans, 2 apps publiees sur le Play Store. Flutter est mon framework favori. Le projet eco de GreenDev me motive.',
                statut: 'acceptee', dateReponse: new Date('2026-02-09'),
                reponseEntreprise: 'Votre experience mobile est impressionnante. Nous serions ravis de vous integrer. Prenons contact pour les formalites.'
            },
            {
                offre: offres[0]._id, candidat: candidats[4]._id,
                message: 'En Master a Ynov Paris, je recherche une alternance full stack. Stage precedent dans une startup parisienne.',
                statut: 'refusee', dateReponse: new Date('2026-02-10'),
                reponseEntreprise: 'Le poste a ete pourvu. Votre profil est neanmoins interessant, nous vous recontacterons si opportunite.'
            },
            {
                offre: offres[5]._id, candidat: candidats[5]._id,
                message: 'En Licence Info de Gestion, solide maitrise d\'Excel et Power BI. Dashboard complet realise en stage de 2e annee.',
                statut: 'en_attente'
            },
            {
                offre: offres[11]._id, candidat: candidats[6]._id, // DevOps SRE - CloudNine
                message: 'En Master Reseaux et Systemes, certifie AWS Solutions Architect Associate. L\'offre SRE chez CloudNine est exactement mon projet.',
                statut: 'vue'
            },
            {
                offre: offres[12]._id, candidat: candidats[7]._id, // Dev WordPress - WebAgency34
                message: 'En BTS SIO, j\'ai deja cree plusieurs sites WordPress pour des associations. A l\'aise en PHP avec un bon sens du design.',
                statut: 'en_attente'
            }
        ];

        const candidatures = [];
        for (const c of candidaturesData) {
            candidatures.push(await Candidature.create(c));
        }
        console.log(`${candidatures.length} candidatures`);

        // =========================
        // EVALUATIONS
        // =========================
        console.log('\n=== Evaluations ===');

        const evals = await Evaluation.insertMany([
            { utilisateur: candidats[0]._id, note: 5, commentaire: 'Excellente plateforme ! Alternance trouvee en 2 semaines. Offres bien detaillees, candidature fluide.', atouts: ['Accompagnement', 'Pédagogie'], faiblesses: [] },
            { utilisateur: candidats[1]._id, note: 4, commentaire: 'Tres bonne experience. Filtres de recherche pratiques. Il manque les notifications email.', atouts: ['Enseignements', 'Intervenants'], faiblesses: ['Accompagnement'] },
            { utilisateur: candidats[3]._id, note: 5, commentaire: 'Interface claire et intuitive. Les entreprises repondent vite. Je recommande a tous les etudiants.', atouts: ['Accompagnement', 'Enseignements', 'Pédagogie'], faiblesses: [] },
            { utilisateur: candidats[4]._id, note: 4, commentaire: 'Bonne selection d\'offres sur Montpellier et Lyon. Suivi des candidatures tres pratique.', atouts: ['Pédagogie', 'Intervenants'], faiblesses: ['Enseignements'] },
            { utilisateur: candidats[5]._id, note: 3, commentaire: 'Correcte mais j\'aurais aime plus d\'offres en data/BI. Design agreable.', atouts: ['Pédagogie'], faiblesses: ['Accompagnement', 'Enseignements'] },
            { utilisateur: candidats[6]._id, note: 5, commentaire: 'Top ! Alternance DevOps decrochee grace a AlternWork. Simple et efficace.', atouts: ['Accompagnement', 'Enseignements', 'Intervenants', 'Pédagogie'], faiblesses: [] }
        ]);
        console.log(`${evals.length} evaluations`);

        // =========================
        // RESUME
        // =========================
        console.log('\n========================================');
        console.log('       SEED TERMINE AVEC SUCCES');
        console.log('========================================');
        console.log('\nComptes:');
        console.log('  Admin     : admin@alternwork.com / Admin123456');
        console.log('  Entreprise: contact@techsolutions.fr / Entreprise123');
        console.log('  Candidat  : lucas.moreau@email.com / Candidat123');
        console.log('\n  (mot de passe entreprises: Entreprise123)');
        console.log('  (mot de passe candidats: Candidat123)');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nConnexion fermee');
    }
}

seed();

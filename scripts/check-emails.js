require('dotenv').config();
const mongoose = require('mongoose');
const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');

async function checkEmails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connecte\n');

        console.log('=== Emails Utilisateurs ===');
        const users = await Utilisateur.find({}, 'email nom prenom role');
        users.forEach(u => console.log(`- ${u.email} (${u.prenom} ${u.nom}, ${u.role})`));

        console.log('\n=== Emails Entreprises ===');
        const entreprises = await Entreprise.find({}, 'email nom');
        entreprises.forEach(e => console.log(`- ${e.email} (${e.nom})`));

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkEmails();

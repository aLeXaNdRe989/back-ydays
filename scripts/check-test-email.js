require('dotenv').config();
const mongoose = require('mongoose');
const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await Utilisateur.findOne({ email: 'test@gmail.com' });
        console.log('Utilisateur test@gmail.com:', user ? 'EXISTE' : 'N\'existe pas');
        if (user) console.log(user);

        const entreprise = await Entreprise.findOne({ email: 'test@gmail.com' });
        console.log('Entreprise test@gmail.com:', entreprise ? 'EXISTE' : 'N\'existe pas');
        if (entreprise) console.log(entreprise);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await mongoose.connection.close();
    }
}

check();

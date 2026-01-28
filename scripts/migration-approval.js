/**
 * Script de migration pour:
 * 1. Mettre tous les utilisateurs existants en isApproved: 'approved'
 * 2. Mettre toutes les entreprises existantes en isApproved: 'approved'
 * 3. Creer un compte admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Utilisateur = require('../models/utilisateur');
const Entreprise = require('../models/entreprise');

const ADMIN_EMAIL = 'admin@alternwork.com';
const ADMIN_PASSWORD = 'Admin123456';

async function migrate() {
    try {
        // Connexion MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connecte');

        // 1. Migrer les utilisateurs existants
        const usersResult = await Utilisateur.updateMany(
            { isApproved: { $exists: false } },
            { $set: { isApproved: 'approved' } }
        );
        console.log(`Utilisateurs migres: ${usersResult.modifiedCount}`);

        // Aussi mettre a jour ceux qui n'ont pas de valeur
        const usersResult2 = await Utilisateur.updateMany(
            { isApproved: null },
            { $set: { isApproved: 'approved' } }
        );
        console.log(`Utilisateurs mis a jour (null -> approved): ${usersResult2.modifiedCount}`);

        // 2. Migrer les entreprises existantes
        const entreprisesResult = await Entreprise.updateMany(
            { isApproved: { $exists: false } },
            { $set: { isApproved: 'approved' } }
        );
        console.log(`Entreprises migrees: ${entreprisesResult.modifiedCount}`);

        const entreprisesResult2 = await Entreprise.updateMany(
            { isApproved: null },
            { $set: { isApproved: 'approved' } }
        );
        console.log(`Entreprises mises a jour (null -> approved): ${entreprisesResult2.modifiedCount}`);

        // 3. Creer l'admin s'il n'existe pas
        const existingAdmin = await Utilisateur.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('Admin existe deja:', ADMIN_EMAIL);
            // S'assurer qu'il a le role admin et est approuve
            await Utilisateur.updateOne(
                { email: ADMIN_EMAIL },
                { $set: { role: 'admin', isApproved: 'approved' } }
            );
            console.log('Admin mis a jour avec role admin et isApproved: approved');
        } else {
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

            const admin = await Utilisateur.create({
                nom: 'Admin',
                prenom: 'Alternwork',
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                isApproved: 'approved'
            });

            console.log('Admin cree:', admin.email);
        }

        // Afficher les stats finales
        const totalUsers = await Utilisateur.countDocuments();
        const totalAdmins = await Utilisateur.countDocuments({ role: 'admin' });
        const totalEntreprises = await Entreprise.countDocuments();
        const pendingUsers = await Utilisateur.countDocuments({ isApproved: 'pending' });
        const pendingEntreprises = await Entreprise.countDocuments({ isApproved: 'pending' });

        console.log('\n=== Stats finales ===');
        console.log(`Total utilisateurs: ${totalUsers}`);
        console.log(`Total admins: ${totalAdmins}`);
        console.log(`Total entreprises: ${totalEntreprises}`);
        console.log(`Utilisateurs en attente: ${pendingUsers}`);
        console.log(`Entreprises en attente: ${pendingEntreprises}`);

        console.log('\n=== Identifiants Admin ===');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);

    } catch (error) {
        console.error('Erreur migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nConnexion fermee');
    }
}

migrate();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Entreprise = require('./models/entreprise');
const Offre = require('./models/offre');
const Utilisateur = require('./models/utilisateur');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté 🚀'))
    .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT} ✅`));

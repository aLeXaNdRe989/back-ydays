const express = require('express');
const entrepriseRoutes = require('./routes/entrepriseRoutes');
const offreRoutes = require('./routes/offreRoutes');
const diplomeRoutes = require('./routes/diplomeRoutes');
const ecoleRoutes = require('./routes/ecoleRoutes');
const etudiantRoutes = require('./routes/etudiantRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const fichiersRoutes = require('./routes/fichiersRoutes');
const partenaireRoutes = require('./routes/partenaireRoutes.Js');
const photoRoute = require('./routes/photoRoutes');
const reponseSignalementRoute = require('./routes/reponseSignalementRoutes');
const signalementRoute = require('./routes/signalementRoutes');
const utilisateurRoute = require('./routes/utilisateurRoutes');
require('./models');


const app = express();

app.use(express.json());

// ➡️ Routes
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/offres', offreRoutes);
app.use('/api/diplomes', diplomeRoutes);
app.use('/api/ecoles', ecoleRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/fichiers', fichiersRoutes);
app.use('/api/partenaires', partenaireRoutes);
app.use('/api/photos', photoRoute);
app.use('/api/reponses-signalement', reponseSignalementRoute);
app.use('/api/signalements',signalementRoute);
app.use('/api/utilisateurs', utilisateurRoute);

module.exports = app;

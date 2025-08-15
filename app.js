require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
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
const { swaggerUi, specs } = require('./configs/swagger');
const swaggerFile = require('./swagger-output.json');


app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/api/auth', authRoutes);
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

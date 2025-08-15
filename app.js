require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://alternwork-front.vercel.app',
];

function isAllowed(origin) {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    try {
        const { hostname } = new URL(origin);
        if (hostname.endsWith('.vercel.app')) return true;
    } catch (_) {}
    return false;
}

const corsOptions = {
    origin(origin, cb) {
        if (isAllowed(origin)) return cb(null, true);
        return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        env: process.env.NODE_ENV || 'development'
    });
});

const { swaggerUi, specs } = require('./configs/swagger');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

require('./models');

const authRoutes = require('./routes/authRoutes');
const entrepriseRoutes = require('./routes/entrepriseRoutes');
const offreRoutes = require('./routes/offreRoutes');
const diplomeRoutes = require('./routes/diplomeRoutes');
const ecoleRoutes = require('./routes/ecoleRoutes');
const etudiantRoutes = require('./routes/etudiantRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const fichiersRoutes = require('./routes/fichiersRoutes');
const partenaireRoutes = require('./routes/partenaireRoutes.js');
const photoRoute = require('./routes/photoRoutes');
const reponseSignalementRoute = require('./routes/reponseSignalementRoutes');
const signalementRoute = require('./routes/signalementRoutes');
const utilisateurRoute = require('./routes/utilisateurRoutes');

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
app.use('/api/signalements', signalementRoute);
app.use('/api/utilisateurs', utilisateurRoute);

app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Erreur serveur' });
});

module.exports = app;

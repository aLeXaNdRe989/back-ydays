require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// En-tetes de securite (OWASP)
app.use(helmet());

// Rate limiting (desactive en test pour eviter les faux positifs)
if (process.env.NODE_ENV !== 'test') {
    // Rate limiting global : 100 requetes par 15 min par IP
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Trop de requêtes, réessayez dans 15 minutes' }
    });
    app.use('/api/', limiter);

    // Rate limiting specifique pour l'auth (protection brute-force)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        message: { error: 'Trop de tentatives, réessayez dans 15 minutes' }
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/forgot-password', authLimiter);
}

const allowedOrigins = [
    'http://localhost:5173',
    'https://alternwork-front.vercel.app',
];

function isAllowedOrigin(origin) {
    if (!origin) return true; // Postman/cURL, same-origin, etc.
    try {
        const { hostname, protocol } = new URL(origin);
        if (protocol !== 'https:' && hostname !== 'localhost') return false;

        // Local
        if (origin === 'http://localhost:5173') return true;

        // Production Vercel
        if (hostname === 'alternwork-front.vercel.app') return true;

        // Previews Vercel de CE projet : alternwork-front-xxxxx-<team>.vercel.app
        if (hostname.startsWith('alternwork-front-') && hostname.endsWith('.vercel.app')) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

app.use((req, res, next) => {
    res.header('Vary', 'Origin'); // éviter les caches foireux
    next();
});

const corsOptions = {
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204
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
const adminRoutes = require('./routes/adminRoutes');
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
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
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
app.use('/api/notifications', notificationRoutes);

app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Erreur serveur' });
});

module.exports = app;

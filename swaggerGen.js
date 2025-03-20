const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'API YDays Backend',
        description: 'Documentation générée automatiquement',
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
    './app.js',
    './routes/entrepriseRoutes.js',
    './routes/utilisateurRoutes.js',
    './routes/offreRoutes.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger JSON généré');
});

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration basique
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API YDays Backend',
            version: '1.0.0',
            description: 'Documentation de l\'API backend YDays',
        },
        servers: [
            {
                url: 'http://localhost:3000/api', // Change si besoin (Render, etc)
            },
        ],
    },
    apis: ['./routes/*.js'], // On pointe vers les routes à documenter
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

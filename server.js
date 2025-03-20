const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connecté');
        app.listen(PORT, () => console.log(`Serveur sur le port ${PORT} 🚀`));
    })
    .catch(err => console.error(err));

const mongoose = require('mongoose');
let mongoServer;

const connectDB = async () => {
    if(mongoose.connection.readyState !== 0){
        console.log("Mongoose est déjà connecté");
        return;
    }

    // Utilise MongoMemoryServer en test
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
};

const closeDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongoServer) {
        await mongoServer.stop();
    }
};

const clearDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany();
    }
};

module.exports = { connectDB, closeDB, clearDB };

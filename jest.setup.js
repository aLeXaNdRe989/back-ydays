const { connectDB, closeDB, clearDB } = require('./utils/db');

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await closeDB();
});

beforeEach(async () => {
    await clearDB();
});

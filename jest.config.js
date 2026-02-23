module.exports = {
    testEnvironment: 'node',
    coverageDirectory: './coverage',
    collectCoverageFrom: [
        'models/**/*.js',
        'controllers/**/*.js',
        'routes/**/*.js',
        'middlewares/**/*.js'
    ],
    setupFilesAfterEnv: ['./jest.setup.js'],
};
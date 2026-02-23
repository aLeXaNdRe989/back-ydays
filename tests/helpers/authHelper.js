const jwt = require('jsonwebtoken');
const Utilisateur = require('../../models/utilisateur');

async function getAuthToken() {
    let user = await Utilisateur.findOne({ email: 'testauth@helper.com' });
    if (!user) {
        user = await Utilisateur.create({
            nom: 'Test',
            prenom: 'Auth',
            email: 'testauth@helper.com',
            password: 'hashedpassword',
            role: 'admin'
        });
    }
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'monSuperSecretJWT', { expiresIn: '1h' });
}

module.exports = { getAuthToken };

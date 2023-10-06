// Banco de dados
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert('serviceAccountKey.json')
});
const db = admin.firestore();

module.exports = db;
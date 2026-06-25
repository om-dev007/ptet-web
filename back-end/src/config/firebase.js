const admin = require('firebase-admin');

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

module.exports = admin;

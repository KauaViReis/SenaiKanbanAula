import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Para lidar com quebras de linha na chave privada da Vercel
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
        });
        console.log('Firebase Admin inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Firebase Admin:', error.message);
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();
export default admin;

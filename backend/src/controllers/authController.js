import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebaseAdmin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_super_segura';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    try {
        // Verificar se usuário já existe
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ error: 'Email já está em uso' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Criar usuário no Firestore
        const newUserRef = db.collection('users').doc();
        const userId = newUserRef.id;

        const userData = {
            id: userId,
            name,
            email,
            password: hashedPassword,
            created_at: new Date().toISOString(),
            avatar: null
        };

        const batch = db.batch();
        batch.set(newUserRef, userData);

        // Inserir categorias padrão
        const categories = [
            { name: 'trabalho', color: '#3b82f6' },
            { name: 'pessoal', color: '#10b981' },
            { name: 'estudos', color: '#8b5cf6' },
            { name: 'casa', color: '#f59e0b' }
        ];

        categories.forEach(cat => {
            const catRef = db.collection('categories').doc();
            batch.set(catRef, {
                user_id: userId,
                name: cat.name,
                color: cat.color
            });
        });

        await batch.commit();

        res.status(201).json({ 
            message: 'Usuário registrado com sucesso',
            userId: userId 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

        if (userSnapshot.empty) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: userDoc.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ 
            message: 'Login bem-sucedido', 
            token,
            user: { id: userDoc.id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro no login', details: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id.toString();
    const { avatar } = req.body;
    
    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ avatar });
        
        const doc = await userRef.get();
        const user = doc.data();
        
        res.status(200).json({
            id: doc.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
    }
};

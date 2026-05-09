import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_super_segura';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Execute registration in a transaction
        const insertUser = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
        const insertCategory = db.prepare('INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)');
        
        const performRegistration = db.transaction(() => {
            const result = insertUser.run(name, email, hashedPassword);
            const userId = result.lastInsertRowid;
            
            // Insert default categories
            insertCategory.run(userId, 'trabalho', '#3b82f6'); // blue
            insertCategory.run(userId, 'pessoal', '#10b981');  // green
            insertCategory.run(userId, 'estudos', '#8b5cf6');  // purple
            insertCategory.run(userId, 'casa', '#f59e0b');     // amber
            
            return userId;
        });

        const newUserId = performRegistration();

        res.status(201).json({ 
            message: 'Usuário registrado com sucesso',
            userId: newUserId 
        });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email já está em uso' });
        }
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ 
            message: 'Login bem-sucedido', 
            token,
            user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro no login' });
    }
};

export const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { avatar } = req.body;
    
    try {
        const stmt = db.prepare('UPDATE users SET avatar = ? WHERE id = ?');
        stmt.run(avatar, userId);
        
        const userStmt = db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?');
        const user = userStmt.get(userId);
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};

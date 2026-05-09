import db from '../db/index.js';

export const getCategories = (req, res) => {
    const userId = req.user.id;
    try {
        const stmt = db.prepare('SELECT * FROM categories WHERE user_id = ?');
        const categories = stmt.all(userId);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
};

export const createCategory = (req, res) => {
    const userId = req.user.id;
    const { name, color } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    try {
        const stmt = db.prepare('INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)');
        const result = stmt.run(userId, name, color || '#808080');
        res.status(201).json({ id: result.lastInsertRowid, name, color });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
};

export const deleteCategory = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const stmt = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?');
        const result = stmt.run(id, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }

        res.status(200).json({ message: 'Categoria excluída' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
};

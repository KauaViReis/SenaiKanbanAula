import { db } from '../config/firebaseAdmin.js';

export const getCategories = async (req, res) => {
    const userId = req.user.id.toString();

    try {
        const snapshot = await db.collection('categories')
            .where('user_id', '==', userId)
            .get();
        
        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias', details: error.message });
    }
};

export const createCategory = async (req, res) => {
    const userId = req.user.id.toString();
    const { name, color } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'O nome da categoria é obrigatório' });
    }

    try {
        const newCategory = {
            user_id: userId,
            name,
            color: color || '#808080'
        };

        const docRef = await db.collection('categories').add(newCategory);

        res.status(201).json({ 
            id: docRef.id,
            ...newCategory 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar categoria', details: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    const userId = req.user.id.toString();
    const categoryId = req.params.id;

    try {
        const catRef = db.collection('categories').doc(categoryId);
        const doc = await catRef.get();

        if (!doc.exists || doc.data().user_id !== userId) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }

        // Remover categoria das tarefas associadas
        const tasksSnapshot = await db.collection('tasks')
            .where('category_id', '==', categoryId)
            .get();
        
        const batch = db.batch();
        tasksSnapshot.docs.forEach(taskDoc => {
            batch.update(taskDoc.ref, { category_id: null });
        });
        
        batch.delete(catRef);
        await batch.commit();

        res.status(200).json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir categoria', details: error.message });
    }
};

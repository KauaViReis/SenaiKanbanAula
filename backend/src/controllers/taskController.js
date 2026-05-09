import { db } from '../config/firebaseAdmin.js';

export const getTasks = async (req, res) => {
    const userId = req.user.id.toString();
    const { status, priority, is_archived = '0', tag, search } = req.query;

    try {
        let tasksRef = db.collection('tasks')
            .where('user_id', '==', userId)
            .where('is_archived', '==', is_archived === '1');

        if (status) {
            tasksRef = tasksRef.where('status', '==', status);
        }
        if (priority) {
            tasksRef = tasksRef.where('priority', '==', priority);
        }

        const snapshot = await tasksRef.orderBy('created_at', 'desc').get();
        let tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtros manuais (Firestore tem limitações com OR e LIKE)
        if (tag) {
            tasks = tasks.filter(t => t.tags && t.tags.includes(tag.toLowerCase()));
        }
        if (search) {
            const searchLower = search.toLowerCase();
            tasks = tasks.filter(t => 
                (t.title && t.title.toLowerCase().includes(searchLower)) || 
                (t.description && t.description.toLowerCase().includes(searchLower))
            );
        }

        res.status(200).json({
            tasks: tasks,
            pagination: {
                total: tasks.length,
                page: 1,
                limit: tasks.length,
                totalPages: 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefas', details: error.message });
    }
};

export const createTask = async (req, res) => {
    const userId = req.user.id.toString();
    const { title, description, due_date, priority, category_id, tags = [], subtasks = [] } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'O título é obrigatório' });
    }

    try {
        const newTask = {
            user_id: userId,
            category_id: category_id ? category_id.toString() : null,
            title,
            description: description || '',
            due_date: due_date || null,
            priority: priority || 'medium',
            status: 'pending',
            is_archived: false,
            tags: tags.map(t => t.trim().toLowerCase()),
            subtasks: subtasks.map(s => ({
                title: s.title.trim(),
                is_completed: !!s.is_completed
            })),
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection('tasks').add(newTask);

        res.status(201).json({ 
            message: 'Tarefa criada com sucesso',
            taskId: docRef.id 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa', details: error.message });
    }
};

export const updateTask = async (req, res) => {
    const userId = req.user.id.toString();
    const taskId = req.params.id;
    const updates = req.body;

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const doc = await taskRef.get();

        if (!doc.exists || doc.data().user_id !== userId) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        // Limpeza de campos e formatação
        const dataToUpdate = {};
        const fields = ['title', 'description', 'due_date', 'priority', 'status', 'category_id', 'is_archived', 'tags', 'subtasks'];
        
        fields.forEach(field => {
            if (updates[field] !== undefined) {
                if (field === 'tags' && Array.isArray(updates.tags)) {
                    dataToUpdate[field] = updates.tags.map(t => t.trim().toLowerCase());
                } else if (field === 'subtasks' && Array.isArray(updates.subtasks)) {
                    dataToUpdate[field] = updates.subtasks.map(s => ({
                        title: s.title.trim(),
                        is_completed: !!s.is_completed
                    }));
                } else if (field === 'category_id') {
                    dataToUpdate[field] = updates[field] ? updates[field].toString() : null;
                } else {
                    dataToUpdate[field] = updates[field];
                }
            }
        });

        await taskRef.update(dataToUpdate);

        res.status(200).json({ message: 'Tarefa atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa', details: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const userId = req.user.id.toString();
    const taskId = req.params.id;

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const doc = await taskRef.get();

        if (!doc.exists || doc.data().user_id !== userId) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        await taskRef.delete();
        res.status(200).json({ message: 'Tarefa excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir tarefa', details: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    const userId = req.user.id.toString();
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        const tasksRef = db.collection('tasks').where('user_id', '==', userId).where('is_archived', '==', false);
        const snapshot = await tasksRef.get();
        const tasks = snapshot.docs.map(doc => doc.data());

        const total = tasks.length;
        const completedToday = tasks.filter(t => 
            t.status === 'completed' && t.due_date && t.due_date.startsWith(todayStr)
        ).length;

        const overdue = tasks.filter(t => 
            t.status === 'pending' && t.due_date && t.due_date < todayStr
        ).length;

        res.status(200).json({ total, completedToday, overdue });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
    }
};

export const getWeeklyStats = async (req, res) => {
    const userId = req.user.id.toString();
    
    try {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const tasksRef = db.collection('tasks')
            .where('user_id', '==', userId)
            .where('status', '==', 'completed');
        
        const snapshot = await tasksRef.get();
        const tasks = snapshot.docs.map(doc => doc.data());

        const stats = last7Days.map(date => ({
            date,
            completed: tasks.filter(t => t.created_at && t.created_at.startsWith(date)).length
        }));

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas semanais', details: error.message });
    }
};

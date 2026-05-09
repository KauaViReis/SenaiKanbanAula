import db from '../db/index.js';

export const getTasks = (req, res) => {
    const userId = req.user.id;
    const { status, priority, page = 1, limit = 20, search, is_archived = '0', tag } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT DISTINCT tasks.* FROM tasks ';
        if (tag) {
            query += ' JOIN task_tags tt ON tasks.id = tt.task_id JOIN tags t ON tt.tag_id = t.id ';
        }
        
        query += ' WHERE tasks.user_id = ? AND tasks.is_archived = ? ';
        const params = [userId, parseInt(is_archived)];

        if (status) {
            query += ' AND tasks.status = ?';
            params.push(status);
        }
        if (priority) {
            query += ' AND tasks.priority = ?';
            params.push(priority);
        }
        if (search) {
            query += ' AND (tasks.title LIKE ? OR tasks.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (tag) {
            query += ' AND t.name = ?';
            params.push(tag.toLowerCase());
        }

        query += ' ORDER BY tasks.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const stmt = db.prepare(query);
        const tasks = stmt.all(...params);

        // Fetch tags for each task
        const getTagsStmt = db.prepare(`
            SELECT t.name FROM tags t
            JOIN task_tags tt ON t.id = tt.tag_id
            WHERE tt.task_id = ?
        `);

        const tasksWithTags = tasks.map(task => {
            const tags = getTagsStmt.all(task.id).map(t => t.name);
            const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY id ASC').all(task.id);
            return { ...task, tags, subtasks };
        });

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(DISTINCT tasks.id) as total FROM tasks ';
        if (tag) {
            countQuery += ' JOIN task_tags tt ON tasks.id = tt.task_id JOIN tags t ON tt.tag_id = t.id ';
        }
        countQuery += ' WHERE tasks.user_id = ? AND tasks.is_archived = ? ';
        
        const countParams = [userId, parseInt(is_archived)];
        if (status) { countQuery += ' AND tasks.status = ?'; countParams.push(status); }
        if (priority) { countQuery += ' AND tasks.priority = ?'; countParams.push(priority); }
        if (search) {
            countQuery += ' AND (tasks.title LIKE ? OR tasks.description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }
        if (tag) {
            countQuery += ' AND t.name = ?';
            countParams.push(tag.toLowerCase());
        }
        
        const total = db.prepare(countQuery).get(...countParams).total;

        res.status(200).json({
            tasks: tasksWithTags,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefas', details: error.message });
    }
};

const handleTags = (taskId, tags) => {
    if (!tags) return;
    
    // Remove existing tags
    db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(taskId);

    if (tags.length > 0) {
        const getTagStmt = db.prepare('SELECT id FROM tags WHERE name = ?');
        const insertTagStmt = db.prepare('INSERT INTO tags (name) VALUES (?)');
        const linkTagStmt = db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)');

        for (const tagName of tags) {
            const cleanTag = tagName.trim().toLowerCase();
            if (!cleanTag) continue;

            let tagId;
            const existingTag = getTagStmt.get(cleanTag);
            
            if (existingTag) {
                tagId = existingTag.id;
            } else {
                const newTag = insertTagStmt.run(cleanTag);
                tagId = newTag.lastInsertRowid;
            }
            
            try {
                linkTagStmt.run(taskId, tagId);
            } catch (e) {
                if (e.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') throw e;
            }
        }
    }
};

const handleSubtasks = (taskId, subtasks) => {
    if (!subtasks) return;
    
    const existingIds = subtasks.filter(s => s.id).map(s => s.id);
    if (existingIds.length > 0) {
        const placeholders = existingIds.map(() => '?').join(',');
        db.prepare(`DELETE FROM subtasks WHERE task_id = ? AND id NOT IN (${placeholders})`).run(taskId, ...existingIds);
    } else {
        db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(taskId);
    }
    
    const insertStmt = db.prepare('INSERT INTO subtasks (task_id, title, is_completed) VALUES (?, ?, ?)');
    const updateStmt = db.prepare('UPDATE subtasks SET title = ?, is_completed = ? WHERE id = ? AND task_id = ?');
    
    for (const st of subtasks) {
        if (st.id) {
            updateStmt.run(st.title, st.is_completed ? 1 : 0, st.id, taskId);
        } else {
            if (st.title && st.title.trim()) {
                insertStmt.run(taskId, st.title.trim(), st.is_completed ? 1 : 0);
            }
        }
    }
};

export const createTask = (req, res) => {
    const userId = req.user.id;
    const { title, description, due_date, priority, category_id, tags = [] } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'O título é obrigatório' });
    }

    try {
        const createTaskTransaction = db.transaction(() => {
            const stmt = db.prepare(`
                INSERT INTO tasks (user_id, category_id, title, description, due_date, priority)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(userId, category_id || null, title, description || '', due_date || null, priority || 'medium');
            const taskId = result.lastInsertRowid;

            handleTags(taskId, tags);
            if (req.body.subtasks) {
                handleSubtasks(taskId, req.body.subtasks);
            }

            return taskId;
        });

        const newTaskId = createTaskTransaction();

        res.status(201).json({ 
            message: 'Tarefa criada com sucesso',
            taskId: newTaskId 
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa', details: error.message });
    }
};

export const updateTask = (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, due_date, priority, status, category_id, is_archived, tags } = req.body;

    try {
        const checkStmt = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?');
        const taskExists = checkStmt.get(taskId, userId);
        
        if (!taskExists) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        const updateTransaction = db.transaction(() => {
            const updates = [];
            const values = [];

            if (title !== undefined) { updates.push('title = ?'); values.push(title); }
            if (description !== undefined) { updates.push('description = ?'); values.push(description); }
            if (due_date !== undefined) { updates.push('due_date = ?'); values.push(due_date); }
            if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
            if (status !== undefined) { updates.push('status = ?'); values.push(status); }
            if (category_id !== undefined) { 
                updates.push('category_id = ?'); 
                values.push(category_id === '' ? null : category_id); 
            }
            if (is_archived !== undefined) { updates.push('is_archived = ?'); values.push(is_archived); }

            if (updates.length > 0) {
                values.push(taskId, userId);
                const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`);
                stmt.run(...values);
            }

            if (tags !== undefined) {
                handleTags(taskId, tags);
            }
            if (req.body.subtasks !== undefined) {
                handleSubtasks(taskId, req.body.subtasks);
            }
        });

        updateTransaction();

        res.status(200).json({ message: 'Tarefa atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa', details: error.message });
    }
};

export const deleteTask = (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;

    try {
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
        const result = stmt.run(taskId, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.status(200).json({ message: 'Tarefa excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir tarefa', details: error.message });
    }
};

export const getDashboardStats = (req, res) => {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        // Only count active tasks for dashboard stats
        const totalStmt = db.prepare('SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND is_archived = 0');
        const total = totalStmt.get(userId).total;

        const completedTodayStmt = db.prepare(`
            SELECT COUNT(*) as completed_today 
            FROM tasks 
            WHERE user_id = ? AND status = 'completed' AND is_archived = 0
            AND date(due_date) = ?
        `);
        const completedToday = completedTodayStmt.get(userId, todayStr).completed_today || 0;

        const overdueStmt = db.prepare(`
            SELECT COUNT(*) as overdue 
            FROM tasks 
            WHERE user_id = ? AND status = 'pending' AND is_archived = 0
            AND date(due_date) < ? AND due_date IS NOT NULL
        `);
        const overdue = overdueStmt.get(userId, todayStr).overdue;

        res.status(200).json({ total, completedToday, overdue });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
    }
};

export const getWeeklyStats = (req, res) => {
    const userId = req.user.id;
    try {
        const stmt = db.prepare(`
            WITH RECURSIVE dates(date) AS (
                SELECT date('now', '-6 days')
                UNION ALL
                SELECT date(date, '+1 day')
                FROM dates
                WHERE date < date('now')
            )
            SELECT 
                dates.date,
                COUNT(tasks.id) as completed
            FROM dates
            LEFT JOIN tasks 
                ON date(tasks.created_at) = dates.date 
                AND tasks.user_id = ? 
                AND tasks.status = 'completed'
            GROUP BY dates.date
            ORDER BY dates.date ASC
        `);
        
        const stats = stmt.all(userId);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar estatísticas semanais', details: error.message });
    }
};

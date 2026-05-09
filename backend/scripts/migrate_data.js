import Database from 'better-sqlite3';
import { db } from '../src/config/firebaseAdmin.js';

const sqliteDb = new Database('database.sqlite');
const mapping = {
    users: {},
    categories: {},
    tasks: {}
};

async function migrate() {
    console.log('Iniciando migração...');

    try {
        // 1. Migrar Usuários
        const users = sqliteDb.prepare('SELECT * FROM users').all();
        console.log(`Migrando ${users.length} usuários...`);
        for (const user of users) {
            const { id, ...userData } = user;
            const docRef = await db.collection('users').add({
                ...userData,
                is_archived: userData.is_archived === 1 // Converter booleano
            });
            mapping.users[id] = docRef.id;
            console.log(`Usuário ${id} -> ${docRef.id}`);
        }

        // 2. Migrar Categorias
        const categories = sqliteDb.prepare('SELECT * FROM categories').all();
        console.log(`Migrando ${categories.length} categorias...`);
        for (const cat of categories) {
            const { id, user_id, ...catData } = cat;
            const newUserId = mapping.users[user_id];
            if (!newUserId) continue;

            const docRef = await db.collection('categories').add({
                ...catData,
                user_id: newUserId
            });
            mapping.categories[id] = docRef.id;
            console.log(`Categoria ${id} -> ${docRef.id}`);
        }

        // 3. Migrar Tarefas (incluindo Tags e Subtasks)
        const tasks = sqliteDb.prepare('SELECT * FROM tasks').all();
        console.log(`Migrando ${tasks.length} tarefas...`);
        for (const task of tasks) {
            const { id, user_id, category_id, ...taskData } = task;
            const newUserId = mapping.users[user_id];
            const newCategoryId = category_id ? mapping.categories[category_id] : null;

            if (!newUserId) continue;

            // Buscar Tags da tarefa
            const tags = sqliteDb.prepare(`
                SELECT t.name FROM tags t 
                JOIN task_tags tt ON t.id = tt.tag_id 
                WHERE tt.task_id = ?
            `).all(id).map(t => t.name.toLowerCase());

            // Buscar Subtasks da tarefa
            const subtasks = sqliteDb.prepare('SELECT title, is_completed FROM subtasks WHERE task_id = ?').all(id)
                .map(s => ({
                    title: s.title,
                    is_completed: s.is_completed === 1
                }));

            const newTask = {
                ...taskData,
                user_id: newUserId,
                category_id: newCategoryId,
                is_archived: taskData.is_archived === 1,
                tags,
                subtasks,
                created_at: taskData.created_at || new Date().toISOString()
            };

            const docRef = await db.collection('tasks').add(newTask);
            mapping.tasks[id] = docRef.id;
            console.log(`Tarefa ${id} -> ${docRef.id}`);
        }

        console.log('\nMigração concluída com sucesso!');
        console.log('Mapeamento final:', JSON.stringify(mapping, null, 2));

    } catch (error) {
        console.error('Erro durante a migração:', error);
    }
}

migrate();

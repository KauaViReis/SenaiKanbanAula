import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getDashboardStats, getWeeklyStats } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de tarefas exigem autenticação
router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/dashboard/stats', getDashboardStats);
router.get('/weekly-stats', getWeeklyStats);

export default router;

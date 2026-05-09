import db from './src/db/index.js';
import { createTask } from './src/controllers/taskController.js';

const mockReq = {
  user: { id: 1 },
  body: { 
    title: 'Test Create', 
    description: 'Testing', 
    due_date: '2026-04-18', 
    priority: 'high', 
    category_id: null, 
    tags: ['test'], 
    subtasks: [{ title: 'Subtask 1', is_completed: false }] 
  },
};
const mockRes = {
  status: (code) => {
    console.log('Status:', code);
    return {
      json: (data) => console.log('Response:', data)
    };
  }
};

createTask(mockReq, mockRes);

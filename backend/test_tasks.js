import db from './src/db/index.js';
import { getTasks, getDashboardStats } from './src/controllers/taskController.js';

const mockReq = {
  user: { id: 2 },
  query: { page: 1, limit: 20, is_archived: '0' },
};
const mockRes = {
  status: (code) => ({
    json: (data) => console.log('Response:', code, data)
  })
};

getTasks(mockReq, mockRes);
getDashboardStats(mockReq, mockRes);

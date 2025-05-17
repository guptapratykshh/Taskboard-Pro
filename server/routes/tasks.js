const express = require('express');
const router = express.Router();
const { 
  getProjectTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  updateTaskStatus, 
  addComment 
} = require('../controllers/taskController');
const { authenticate } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all tasks for a project
router.get('/project/:projectId', getProjectTasks);

// Get a single task by ID
router.get('/:taskId', getTask);

// Create a new task
router.post('/', createTask);

// Update a task
router.put('/:taskId', updateTask);

// Delete a task
router.delete('/:taskId', deleteTask);

// Update task status
router.put('/:taskId/status', updateTaskStatus);

// Add a comment to a task
router.post('/:taskId/comments', addComment);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { 
  getProjectAutomations, 
  createAutomation, 
  updateAutomation, 
  deleteAutomation 
} = require('../controllers/automationController');
const { authenticate } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all automations for a project
router.get('/project/:projectId', getProjectAutomations);

// Create a new automation
router.post('/', createAutomation);

// Update an automation
router.put('/:automationId', updateAutomation);

// Delete an automation
router.delete('/:automationId', deleteAutomation);

module.exports = router; 
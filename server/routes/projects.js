const express = require('express');
const router = express.Router();
const { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject, 
  addMember, 
  removeMember, 
  updateStatuses 
} = require('../controllers/projectController');
const { authenticate, isProjectOwner } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all projects for current user
router.get('/', getProjects);

// Get a specific project
router.get('/:projectId', getProject);

// Create a new project
router.post('/', createProject);

// Update a project (only owner)
router.put('/:projectId', isProjectOwner, updateProject);

// Delete a project (only owner)
router.delete('/:projectId', isProjectOwner, deleteProject);

// Add a member to a project (only owner)
router.post('/:projectId/members', isProjectOwner, addMember);

// Remove a member from a project (only owner)
router.delete('/:projectId/members/:userId', isProjectOwner, removeMember);

// Update project statuses (only owner)
router.put('/:projectId/statuses', isProjectOwner, updateStatuses);

module.exports = router; 
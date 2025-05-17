const Automation = require('../models/Automation');
const Project = require('../models/Project');

// Get all automations for a project
const getProjectAutomations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: projectId,
      'members.user': userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Get all automations for the project
    const automations = await Automation.find({ project: projectId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(automations);
  } catch (error) {
    console.error('Get project automations error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new automation
const createAutomation = async (req, res) => {
  try {
    const { project, name, description, trigger, action } = req.body;
    const userId = req.user._id;
    
    // Check if project exists and user is the owner
    const projectDoc = await Project.findOne({
      _id: project,
      owner: userId
    });
    
    if (!projectDoc) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Validate trigger type
    const validTriggerTypes = ['taskMoved', 'taskAssigned', 'dueDatePassed', 'taskCreated'];
    if (!validTriggerTypes.includes(trigger.type)) {
      return res.status(400).json({ error: 'Invalid trigger type' });
    }
    
    // Validate action type
    const validActionTypes = ['assignBadge', 'moveTask', 'sendNotification'];
    if (!validActionTypes.includes(action.type)) {
      return res.status(400).json({ error: 'Invalid action type' });
    }
    
    // Validate specific trigger conditions
    if (trigger.type === 'taskMoved') {
      // For taskMoved, validate that statuses exist if specified
      if (trigger.conditions?.fromStatus) {
        const fromStatusExists = projectDoc.statuses.some(s => s.name === trigger.conditions.fromStatus);
        if (!fromStatusExists) {
          return res.status(400).json({ error: 'Invalid fromStatus' });
        }
      }
      
      if (trigger.conditions?.toStatus) {
        const toStatusExists = projectDoc.statuses.some(s => s.name === trigger.conditions.toStatus);
        if (!toStatusExists) {
          return res.status(400).json({ error: 'Invalid toStatus' });
        }
      }
    }
    
    // Validate specific action details
    if (action.type === 'moveTask' && action.details?.targetStatus) {
      const targetStatusExists = projectDoc.statuses.some(s => s.name === action.details.targetStatus);
      if (!targetStatusExists) {
        return res.status(400).json({ error: 'Invalid targetStatus' });
      }
    }
    
    // Create new automation
    const automation = new Automation({
      project,
      name,
      description,
      createdBy: userId,
      trigger,
      action,
      active: true
    });
    
    await automation.save();
    
    // Populate creator data
    await automation.populate('createdBy', 'name email');
    
    res.status(201).json(automation);
  } catch (error) {
    console.error('Create automation error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update an automation
const updateAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const { name, description, active, trigger, action } = req.body;
    const userId = req.user._id;
    
    // Find automation
    const automation = await Automation.findById(automationId);
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    // Check if user is the project owner
    const project = await Project.findOne({
      _id: automation.project,
      owner: userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update fields
    if (name) automation.name = name;
    if (description !== undefined) automation.description = description;
    if (active !== undefined) automation.active = active;
    
    // Update trigger if provided
    if (trigger) {
      // Validate trigger type
      const validTriggerTypes = ['taskMoved', 'taskAssigned', 'dueDatePassed', 'taskCreated'];
      if (!validTriggerTypes.includes(trigger.type)) {
        return res.status(400).json({ error: 'Invalid trigger type' });
      }
      
      // Validate specific trigger conditions
      if (trigger.type === 'taskMoved') {
        // For taskMoved, validate that statuses exist if specified
        if (trigger.conditions?.fromStatus) {
          const fromStatusExists = project.statuses.some(s => s.name === trigger.conditions.fromStatus);
          if (!fromStatusExists) {
            return res.status(400).json({ error: 'Invalid fromStatus' });
          }
        }
        
        if (trigger.conditions?.toStatus) {
          const toStatusExists = project.statuses.some(s => s.name === trigger.conditions.toStatus);
          if (!toStatusExists) {
            return res.status(400).json({ error: 'Invalid toStatus' });
          }
        }
      }
      
      automation.trigger = trigger;
    }
    
    // Update action if provided
    if (action) {
      // Validate action type
      const validActionTypes = ['assignBadge', 'moveTask', 'sendNotification'];
      if (!validActionTypes.includes(action.type)) {
        return res.status(400).json({ error: 'Invalid action type' });
      }
      
      // Validate specific action details
      if (action.type === 'moveTask' && action.details?.targetStatus) {
        const targetStatusExists = project.statuses.some(s => s.name === action.details.targetStatus);
        if (!targetStatusExists) {
          return res.status(400).json({ error: 'Invalid targetStatus' });
        }
      }
      
      automation.action = action;
    }
    
    await automation.save();
    
    // Populate creator data
    await automation.populate('createdBy', 'name email');
    
    res.json(automation);
  } catch (error) {
    console.error('Update automation error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete an automation
const deleteAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const userId = req.user._id;
    
    // Find automation
    const automation = await Automation.findById(automationId);
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    // Check if user is the project owner
    const project = await Project.findOne({
      _id: automation.project,
      owner: userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await Automation.findByIdAndDelete(automationId);
    
    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('Delete automation error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProjectAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation
}; 
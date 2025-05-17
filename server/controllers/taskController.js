const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Automation = require('../models/Automation');

// Get all tasks for a project
const getProjectTasks = async (req, res) => {
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
    
    // Get all tasks for the project
    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get project tasks error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single task by ID
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    
    // Find task and populate related fields
    const task = await Task.findById(taskId)
      .populate('assignee', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email profilePicture')
      .populate('history.user', 'name email');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: task.project,
      'members.user': userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, project, status, assignee, dueDate, priority } = req.body;
    const userId = req.user._id;
    
    // Check if project exists and user is a member
    const projectDoc = await Project.findOne({
      _id: project,
      'members.user': userId
    });
    
    if (!projectDoc) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Validate status
    const validStatus = projectDoc.statuses.some(s => s.name === status);
    if (status && !validStatus) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get the highest order number for the status
    const highestOrderTask = await Task.findOne({ 
      project, 
      status: status || projectDoc.statuses[0].name 
    }).sort({ order: -1 });
    
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;
    
    // Create new task
    const task = new Task({
      title,
      description,
      project,
      status: status || projectDoc.statuses[0].name,
      assignee,
      createdBy: userId,
      dueDate,
      priority,
      order,
      history: [{
        user: userId,
        action: 'created',
        timestamp: Date.now()
      }]
    });
    
    await task.save();
    
    // Populate task data
    await task.populate('assignee', 'name email profilePicture');
    await task.populate('createdBy', 'name email');
    
    // Check for automations triggered by task creation
    await checkAutomations('taskCreated', task);
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${project}`).emit('task_created', task);
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, assignee, dueDate, priority } = req.body;
    const userId = req.user._id;
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: task.project,
      'members.user': userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Track changes for history
    const history = [];
    
    if (title && title !== task.title) {
      history.push({
        user: userId,
        action: 'updated title',
        prevValue: task.title,
        newValue: title,
        timestamp: Date.now()
      });
      task.title = title;
    }
    
    if (description !== undefined && description !== task.description) {
      history.push({
        user: userId,
        action: 'updated description',
        timestamp: Date.now()
      });
      task.description = description;
    }
    
    if (status && status !== task.status) {
      // Validate status
      const validStatus = project.statuses.some(s => s.name === status);
      if (!validStatus) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      history.push({
        user: userId,
        action: 'moved',
        prevValue: task.status,
        newValue: status,
        timestamp: Date.now()
      });
      
      const prevStatus = task.status;
      task.status = status;
      
      // Check for automations triggered by task movement
      await checkAutomations('taskMoved', task, { fromStatus: prevStatus, toStatus: status });
    }
    
    if (assignee !== undefined && assignee !== task.assignee?.toString()) {
      const prevAssignee = task.assignee;
      
      history.push({
        user: userId,
        action: 'assigned',
        prevValue: prevAssignee,
        newValue: assignee,
        timestamp: Date.now()
      });
      
      task.assignee = assignee;
      
      // Check for automations triggered by task assignment
      await checkAutomations('taskAssigned', task, { assignee });
    }
    
    if (dueDate !== undefined && new Date(dueDate).getTime() !== new Date(task.dueDate).getTime()) {
      history.push({
        user: userId,
        action: 'updated due date',
        prevValue: task.dueDate,
        newValue: dueDate,
        timestamp: Date.now()
      });
      task.dueDate = dueDate;
    }
    
    if (priority && priority !== task.priority) {
      history.push({
        user: userId,
        action: 'updated priority',
        prevValue: task.priority,
        newValue: priority,
        timestamp: Date.now()
      });
      task.priority = priority;
    }
    
    // Add history records if there were changes
    if (history.length > 0) {
      task.history.push(...history);
    }
    
    await task.save();
    
    // Populate task data
    await task.populate('assignee', 'name email profilePicture');
    await task.populate('createdBy', 'name email');
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${task.project}`).emit('task_updated', task);
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is a member of the project with appropriate permissions
    const project = await Project.findOne({
      _id: task.project,
      'members.user': userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if user is project owner or task creator
    const isOwner = project.owner.toString() === userId.toString();
    const isCreator = task.createdBy.toString() === userId.toString();
    
    if (!isOwner && !isCreator) {
      return res.status(403).json({ error: 'Unauthorized to delete this task' });
    }
    
    await Task.findByIdAndDelete(taskId);
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${task.project}`).emit('task_deleted', { taskId, projectId: task.project });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: task.project,
      'members.user': userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Validate status
    const validStatus = project.statuses.some(s => s.name === status);
    if (!validStatus) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get the highest order number for the target status
    const highestOrderTask = await Task.findOne({ 
      project: task.project, 
      status 
    }).sort({ order: -1 });
    
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;
    
    // Record previous status for history
    const prevStatus = task.status;
    
    // Update task
    task.status = status;
    task.order = order;
    task.history.push({
      user: userId,
      action: 'moved',
      prevValue: prevStatus,
      newValue: status,
      timestamp: Date.now()
    });
    
    await task.save();
    
    // Check for automations triggered by task movement
    await checkAutomations('taskMoved', task, { fromStatus: prevStatus, toStatus: status });
    
    // Populate task data
    await task.populate('assignee', 'name email profilePicture');
    await task.populate('createdBy', 'name email');
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${task.project}`).emit('task_moved', {
      task,
      prevStatus,
      newStatus: status
    });
    
    res.json(task);
  } catch (error) {
    console.error('Update task status error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a comment to a task
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    // Find task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: task.project,
      'members.user': userId
    });
    
    if (!project) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Add comment
    const comment = {
      user: userId,
      text,
      createdAt: Date.now()
    };
    
    task.comments.push(comment);
    
    // Add to history
    task.history.push({
      user: userId,
      action: 'commented',
      timestamp: Date.now()
    });
    
    await task.save();
    
    // Get the newly added comment with populated user
    const newComment = task.comments[task.comments.length - 1];
    await task.populate('comments.user', 'name email profilePicture');
    
    const populatedComment = task.comments.find(c => c._id.toString() === newComment._id.toString());
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${task.project}`).emit('comment_added', {
      taskId,
      comment: populatedComment
    });
    
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Add comment error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to check and execute automations
const checkAutomations = async (triggerType, task, conditions = {}) => {
  try {
    // Find applicable automations
    const automations = await Automation.find({
      project: task.project,
      active: true,
      'trigger.type': triggerType
    });
    
    if (!automations || automations.length === 0) {
      return;
    }
    
    for (const automation of automations) {
      let shouldTrigger = true;
      
      // Check conditions based on trigger type
      if (triggerType === 'taskMoved') {
        if (automation.trigger.conditions?.fromStatus && 
            automation.trigger.conditions.fromStatus !== conditions.fromStatus) {
          shouldTrigger = false;
        }
        
        if (automation.trigger.conditions?.toStatus && 
            automation.trigger.conditions.toStatus !== conditions.toStatus) {
          shouldTrigger = false;
        }
      }
      
      if (triggerType === 'taskAssigned') {
        if (automation.trigger.conditions?.assignee && 
            automation.trigger.conditions.assignee.toString() !== conditions.assignee) {
          shouldTrigger = false;
        }
      }
      
      if (shouldTrigger) {
        // Execute automation action
        await executeAutomationAction(automation, task);
        
        // Update automation execution count
        automation.executionCount += 1;
        automation.lastExecuted = Date.now();
        await automation.save();
      }
    }
  } catch (error) {
    console.error('Check automations error:', error.message);
  }
};

// Execute automation action
const executeAutomationAction = async (automation, task) => {
  const actionType = automation.action.type;
  const details = automation.action.details;
  
  try {
    switch (actionType) {
      case 'assignBadge':
        if (task.assignee) {
          // Find the user
          const user = await User.findById(task.assignee);
          if (user) {
            // Add badge to user
            user.badges.push({
              name: details.badgeName,
              description: details.badgeDescription,
              awardedAt: Date.now()
            });
            await user.save();
          }
        }
        break;
        
      case 'moveTask':
        if (details.targetStatus) {
          // Update task status
          task.status = details.targetStatus;
          task.history.push({
            action: 'moved by automation',
            prevValue: task.status,
            newValue: details.targetStatus,
            timestamp: Date.now()
          });
          await task.save();
        }
        break;
        
      case 'sendNotification':
        // In a real implementation, this would create a notification
        // and potentially send an email or push notification
        console.log(`Notification: ${details.notificationMessage}`);
        break;
        
      default:
        console.log(`Unknown action type: ${actionType}`);
    }
  } catch (error) {
    console.error('Execute automation action error:', error.message);
  }
};

module.exports = {
  getProjectTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment
}; 
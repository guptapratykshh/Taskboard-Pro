const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// Get all projects for a user
const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all projects where user is a member
    const projects = await Project.find({
      'members.user': userId
    }).populate('owner', 'name email profilePicture')
      .sort({ updatedAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single project by ID
const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    // Find project and check if user is a member
    const project = await Project.findOne({
      _id: projectId,
      'members.user': userId
    }).populate('owner', 'name email profilePicture')
      .populate('members.user', 'name email profilePicture');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;
    
    // Create new project
    const project = new Project({
      title,
      description,
      owner: userId,
      members: [{ user: userId, role: 'owner' }]
    });
    
    await project.save();
    
    // Populate owner data
    await project.populate('owner', 'name email profilePicture');
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;
    
    // Find project and check if user is the owner
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Update project
    project.title = title || project.title;
    project.description = description || project.description;
    project.updatedAt = Date.now();
    
    await project.save();
    
    // Populate owner data
    await project.populate('owner', 'name email profilePicture');
    await project.populate('members.user', 'name email profilePicture');
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${projectId}`).emit('project_updated', project);
    
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    // Find project and check if user is the owner
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Delete all tasks associated with the project
    await Task.deleteMany({ project: projectId });
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${projectId}`).emit('project_deleted', { projectId });
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a member to a project
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user._id;
    
    // Find project and check if user is the owner
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already a member
    const isMember = project.members.some(member => 
      member.user.toString() === user._id.toString()
    );
    
    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    // Add user to project members
    project.members.push({
      user: user._id,
      role: role || 'viewer',
      addedAt: Date.now()
    });
    
    await project.save();
    
    // Populate member data
    await project.populate('members.user', 'name email profilePicture');
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${projectId}`).emit('member_added', {
      project: projectId,
      member: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        },
        role: role || 'viewer',
        addedAt: new Date()
      }
    });
    
    res.json(project.members);
  } catch (error) {
    console.error('Add member error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove a member from a project
const removeMember = async (req, res) => {
  try {
    const { projectId, userId: memberId } = req.params;
    const userId = req.user._id;
    
    // Find project and check if user is the owner
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Check if trying to remove the owner
    if (memberId === project.owner.toString()) {
      return res.status(400).json({ error: 'Cannot remove the project owner' });
    }
    
    // Remove member from project
    project.members = project.members.filter(member => 
      member.user.toString() !== memberId
    );
    
    await project.save();
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${projectId}`).emit('member_removed', {
      project: projectId,
      memberId
    });
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update project statuses
const updateStatuses = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { statuses } = req.body;
    const userId = req.user._id;
    
    // Find project and check if user is the owner
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    // Update project statuses
    project.statuses = statuses;
    project.updatedAt = Date.now();
    
    await project.save();
    
    // Notify project members via socket.io
    const io = req.app.locals.io;
    io.to(`project-${projectId}`).emit('statuses_updated', {
      project: projectId,
      statuses
    });
    
    res.json(project.statuses);
  } catch (error) {
    console.error('Update statuses error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateStatuses
}; 
 
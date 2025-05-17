const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

// Middleware to authenticate user using JWT
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is a project member
const isProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is a project member
    const isMember = project.members.some(member => 
      member.user.toString() === userId.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add project to request
    req.project = project;
    
    next();
  } catch (error) {
    console.error('Project access error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware to check if user is a project owner
const isProjectOwner = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is the project owner
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add project to request
    req.project = project;
    
    next();
  } catch (error) {
    console.error('Project owner check error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  authenticate,
  isProjectMember,
  isProjectOwner
}; 
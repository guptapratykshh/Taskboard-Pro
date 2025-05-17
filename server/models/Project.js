const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statuses: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#3498db'
    },
    order: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add default statuses when creating a new project
projectSchema.pre('save', function(next) {
  if (this.isNew && (!this.statuses || this.statuses.length === 0)) {
    this.statuses = [
      { name: 'To Do', color: '#3498db', order: 0 },
      { name: 'In Progress', color: '#f39c12', order: 1 },
      { name: 'Done', color: '#2ecc71', order: 2 }
    ];
  }
  
  // Make sure owner is also in members array
  if (this.isNew) {
    const ownerExists = this.members.some(member => 
      member.user.toString() === this.owner.toString() && member.role === 'owner'
    );
    
    if (!ownerExists) {
      this.members.push({
        user: this.owner,
        role: 'owner',
        addedAt: new Date()
      });
    }
  }
  
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 
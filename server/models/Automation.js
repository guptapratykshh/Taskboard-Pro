const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  trigger: {
    type: {
      type: String,
      enum: ['taskMoved', 'taskAssigned', 'dueDatePassed', 'taskCreated'],
      required: true
    },
    conditions: {
      // For taskMoved
      fromStatus: {
        type: String
      },
      toStatus: {
        type: String
      },
      // For taskAssigned
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
      // No additional conditions needed for dueDatePassed or taskCreated
    }
  },
  action: {
    type: {
      type: String,
      enum: ['assignBadge', 'moveTask', 'sendNotification'],
      required: true
    },
    details: {
      // For assignBadge
      badgeName: {
        type: String
      },
      badgeDescription: {
        type: String
      },
      // For moveTask
      targetStatus: {
        type: String
      },
      // For sendNotification
      notificationMessage: {
        type: String
      }
    }
  },
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecuted: {
    type: Date
  }
}, {
  timestamps: true
});

// Create index for faster queries
automationSchema.index({ project: 1, 'trigger.type': 1 });

const Automation = mongoose.model('Automation', automationSchema);

module.exports = Automation; 
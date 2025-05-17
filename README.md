# TaskBoard Pro - Advanced Task Collaboration App

TaskBoard Pro is a project collaboration platform where users can create projects, add tasks, move tasks across statuses, assign tasks to teammates, and set automation rules (mini workflows).

![TaskBoard Pro Screenshot](https://via.placeholder.com/800x450?text=TaskBoard+Pro+Screenshot)

## Features

### User Authentication
- Google OAuth (Firebase) login
- Local authentication with email/password
- User profile management

### Project Management
- Create projects with title and description
- Invite team members by email
- Role-based access control (owner, editor, viewer)
- Custom project statuses (Kanban board)

### Task Management
- Create tasks with title, description, due date, and assignee
- Move tasks across different statuses
- Kanban board view for visualizing task progress
- Task commenting system
- Task history tracking

### Workflow Automation
- Create custom automation rules:
  - When a task is moved to 'Done' -> assign badge
  - When a task is assigned to user X -> move to 'In Progress'
  - When a due date passes -> send notification
- Server-side automation processing

### Real-time Updates
- WebSockets for instant updates across clients
- Real-time notifications for task movements and comments

## Tech Stack

### Frontend
- React (with TypeScript)
- Material UI for components
- React Router for navigation
- Socket.io client for real-time updates
- React Beautiful DnD for drag-and-drop
- Firebase for Google authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- Firebase Admin SDK for OAuth verification

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/taskboard-pro.git
cd taskboard-pro
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Create a .env file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskboard-pro
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
```

5. Start the backend server
```bash
cd ../server
npm run dev
```

6. Start the frontend development server
```bash
cd ../client
npm start
```

7. Open your browser and navigate to http://localhost:3000

## Project Structure

```
taskboard-pro/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json        # Frontend dependencies
│
├── server/                 # Backend Express application
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── index.js            # Entry point
│   └── package.json        # Backend dependencies
│
└── README.md               # Project documentation
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String, // Hashed, not required for OAuth users
  profilePicture: String,
  authProvider: String, // 'local' or 'google'
  googleId: String,
  badges: [{
    name: String,
    description: String,
    awardedAt: Date
  }],
  notifications: {
    email: Boolean,
    inApp: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  owner: ObjectId (ref: 'User'),
  members: [{
    user: ObjectId (ref: 'User'),
    role: String, // 'owner', 'editor', 'viewer'
    addedAt: Date
  }],
  statuses: [{
    name: String,
    color: String,
    order: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  project: ObjectId (ref: 'Project'),
  status: String,
  assignee: ObjectId (ref: 'User'),
  createdBy: ObjectId (ref: 'User'),
  dueDate: Date,
  priority: String, // 'low', 'medium', 'high'
  comments: [{
    user: ObjectId (ref: 'User'),
    text: String,
    createdAt: Date
  }],
  history: [{
    user: ObjectId (ref: 'User'),
    action: String,
    prevValue: Mixed,
    newValue: Mixed,
    timestamp: Date
  }],
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Automation Model
```javascript
{
  project: ObjectId (ref: 'Project'),
  name: String,
  description: String,
  createdBy: ObjectId (ref: 'User'),
  active: Boolean,
  trigger: {
    type: String, // 'taskMoved', 'taskAssigned', 'dueDatePassed', 'taskCreated'
    conditions: {
      fromStatus: String,
      toStatus: String,
      assignee: ObjectId (ref: 'User')
    }
  },
  action: {
    type: String, // 'assignBadge', 'moveTask', 'sendNotification'
    details: {
      badgeName: String,
      badgeDescription: String,
      targetStatus: String,
      notificationMessage: String
    }
  },
  executionCount: Number,
  lastExecuted: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Documentation

For detailed API documentation, see [server/README.md](server/README.md).

## Automation Engine

The automation engine allows users to create custom workflows based on triggers and actions:

### Triggers
- `taskMoved` - When a task is moved to a specific status
- `taskAssigned` - When a task is assigned to a specific user
- `dueDatePassed` - When a task's due date has passed
- `taskCreated` - When a new task is created

### Actions
- `assignBadge` - Award a badge to the task assignee
- `moveTask` - Move the task to a specific status
- `sendNotification` - Send a notification to relevant users

Example automation JSON:
```json
{
  "project": "project_id",
  "name": "Complete Task Badge",
  "description": "Award badge when task is moved to Done",
  "trigger": {
    "type": "taskMoved",
    "conditions": {
      "toStatus": "Done"
    }
  },
  "action": {
    "type": "assignBadge",
    "details": {
      "badgeName": "Task Completer",
      "badgeDescription": "Completed a task successfully"
    }
  }
}
```

## License

MIT 
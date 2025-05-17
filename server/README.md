# TaskBoard Pro - Backend API

This is the backend API for TaskBoard Pro, a project collaboration platform where users can create projects, add tasks, move tasks across statuses, assign tasks to teammates, and set automation rules (mini workflows).

## Technologies Used

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication
- Firebase Admin SDK for Google OAuth verification

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/taskboard-pro.git
cd taskboard-pro/server
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskboard-pro
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
```

4. Start the development server
```bash
npm run dev
```

5. The API will be available at http://localhost:5000

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
  - Request body: `{ name, email, password }`
  - Response: `{ user, token }`

- `POST /api/auth/login` - Login with email/password
  - Request body: `{ email, password }`
  - Response: `{ user, token }`

- `POST /api/auth/google` - Login with Google OAuth
  - Request body: `{ idToken }`
  - Response: `{ user, token }`

- `GET /api/auth/profile` - Get current user profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ user }`

### Project Endpoints

- `GET /api/projects` - Get all projects for current user
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ project }]`

- `GET /api/projects/:projectId` - Get a specific project
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ project }`

- `POST /api/projects` - Create a new project
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, description }`
  - Response: `{ project }`

- `PUT /api/projects/:projectId` - Update a project
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, description }`
  - Response: `{ project }`

- `DELETE /api/projects/:projectId` - Delete a project
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message }`

- `POST /api/projects/:projectId/members` - Add a member to a project
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ email, role }`
  - Response: `[{ members }]`

- `DELETE /api/projects/:projectId/members/:userId` - Remove a member from a project
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message }`

- `PUT /api/projects/:projectId/statuses` - Update project statuses
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ statuses: [{ name, color, order }] }`
  - Response: `[{ statuses }]`

### Task Endpoints

- `GET /api/tasks/project/:projectId` - Get all tasks for a project
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ task }]`

- `GET /api/tasks/:taskId` - Get a specific task
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ task }`

- `POST /api/tasks` - Create a new task
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, description, project, status, assignee, dueDate, priority }`
  - Response: `{ task }`

- `PUT /api/tasks/:taskId` - Update a task
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, description, status, assignee, dueDate, priority }`
  - Response: `{ task }`

- `DELETE /api/tasks/:taskId` - Delete a task
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message }`

- `PUT /api/tasks/:taskId/status` - Update task status
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ status }`
  - Response: `{ task }`

- `POST /api/tasks/:taskId/comments` - Add a comment to a task
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ text }`
  - Response: `{ comment }`

### Automation Endpoints

- `GET /api/automations/project/:projectId` - Get all automations for a project
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ automation }]`

- `POST /api/automations` - Create a new automation
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ project, name, description, trigger, action }`
  - Response: `{ automation }`

- `PUT /api/automations/:automationId` - Update an automation
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ name, description, active, trigger, action }`
  - Response: `{ automation }`

- `DELETE /api/automations/:automationId` - Delete an automation
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message }`

## Project Structure

```
server/
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── index.js         # Application entry point
└── package.json     # Dependencies and scripts
```

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
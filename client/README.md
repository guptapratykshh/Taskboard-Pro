# TaskBoard Pro - Frontend

This is the frontend application for TaskBoard Pro, a project collaboration platform where users can create projects, add tasks, move tasks across statuses, assign tasks to teammates, and set automation rules (mini workflows).

## Technologies Used

- React 18 with TypeScript
- Material UI for components and styling
- React Router for navigation
- Axios for API requests
- Socket.io for real-time updates
- React Beautiful DnD for drag-and-drop functionality

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/taskboard-pro.git
cd taskboard-pro/client
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the client directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server
```bash
npm start
```

5. Open your browser and navigate to http://localhost:3000

## Features

- User authentication with email/password and Google OAuth
- Project management
  - Create and manage projects
  - Invite team members
  - Customize project statuses
- Task management
  - Kanban board view
  - Create, update, and delete tasks
  - Drag-and-drop tasks between statuses
  - Task comments
- Workflow automation
  - Create custom automation rules
  - Trigger actions based on task events
- Real-time updates
  - Instant notifications for task movements
  - Live collaboration

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout/       # Layout components
│   ├── Project/      # Project-related components
│   └── Task/         # Task-related components
├── contexts/         # React contexts
├── pages/            # Page components
├── services/         # API and utility services
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
└── index.tsx         # Application entry point
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

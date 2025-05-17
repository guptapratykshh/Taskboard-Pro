import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Record<string, Function[]> = {};

  // Connect to socket server
  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token')
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Setup listeners for various events
    this.setupListeners();
  }

  // Disconnect socket
  disconnect() {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
    this.listeners = {};
  }

  // Join a project room to receive project-specific events
  joinProject(projectId: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('join-project', projectId);
  }

  // Leave a project room
  leaveProject(projectId: string) {
    this.socket?.emit('leave-project', projectId);
  }

  // Setup listeners for various events
  private setupListeners() {
    if (!this.socket) return;

    // Project events
    this.socket.on('project_updated', (data) => {
      this.triggerEvent('project_updated', data);
    });

    this.socket.on('project_deleted', (data) => {
      this.triggerEvent('project_deleted', data);
    });

    // Member events
    this.socket.on('member_added', (data) => {
      this.triggerEvent('member_added', data);
    });

    this.socket.on('member_removed', (data) => {
      this.triggerEvent('member_removed', data);
    });

    // Task events
    this.socket.on('task_created', (data) => {
      this.triggerEvent('task_created', data);
    });

    this.socket.on('task_updated', (data) => {
      this.triggerEvent('task_updated', data);
    });

    this.socket.on('task_deleted', (data) => {
      this.triggerEvent('task_deleted', data);
    });

    this.socket.on('task_moved', (data) => {
      this.triggerEvent('task_moved', data);
    });

    // Comment events
    this.socket.on('comment_added', (data) => {
      this.triggerEvent('comment_added', data);
    });

    // Automation events
    this.socket.on('automation_triggered', (data) => {
      this.triggerEvent('automation_triggered', data);
    });
  }

  // Register event listener
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    );
  }

  // Trigger event for all listeners
  private triggerEvent(event: string, data: any) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach((callback) => {
      callback(data);
    });
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 
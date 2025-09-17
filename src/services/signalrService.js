import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../utils/constants';

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = new Map();
  }

  async initialize(token, user) {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL.replace('/api', '')}/hubs/budget`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    // Set up event handlers
    this.connection.onreconnecting(() => {
      console.log('SignalR: Connection lost, reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR: Reconnected successfully');
      this.joinGroups(user);
    });

    this.connection.onclose(() => {
      console.log('SignalR: Connection closed');
    });

    try {
      await this.connection.start();
      console.log('SignalR: Connected successfully');
      
      // Join appropriate groups based on user role and department
      await this.joinGroups(user);
      
      // Set up event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('SignalR: Connection failed', error);
    }
  }

  async joinGroups(user) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      // Join role-based groups
      if (user?.role === 1) { // FinanceAdmin
        await this.connection.invoke('JoinGroup', 'role-FinanceAdmin');
      } else if (user?.role === 2) { // DepartmentHead
        await this.connection.invoke('JoinGroup', 'role-DepartmentHead');
      } else if (user?.role === 3) { // Management
        await this.connection.invoke('JoinGroup', 'role-Management');
      }

      // Join department-based groups
      if (user?.departmentId) {
        await this.connection.invoke('JoinGroup', `dep-${user.departmentId}`);
      }

      console.log('SignalR: Joined groups successfully');
    } catch (error) {
      console.error('SignalR: Failed to join groups', error);
    }
  }

  setupEventListeners() {
    if (!this.connection) return;

    // Allocation events
    this.connection.on('allocationUpdated', (data) => {
      this.notifyCallbacks('allocationUpdated', data);
    });

    // Utilization events
    this.connection.on('utilizationUpdated', (data) => {
      this.notifyCallbacks('utilizationUpdated', data);
    });

    // Request events
    this.connection.on('requestsUpdated', (data) => {
      this.notifyCallbacks('requestsUpdated', data);
    });

    // Notification events
    this.connection.on('notificationReceived', (data) => {
      this.notifyCallbacks('notificationReceived', data);
    });

    // Threshold alert events
    this.connection.on('thresholdAlert', (data) => {
      this.notifyCallbacks('thresholdAlert', data);
    });
  }

  subscribe(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventCallbacks = this.callbacks.get(event);
      if (eventCallbacks) {
        eventCallbacks.delete(callback);
        if (eventCallbacks.size === 0) {
          this.callbacks.delete(event);
        }
      }
    };
  }

  notifyCallbacks(event, data) {
    const eventCallbacks = this.callbacks.get(event);
    if (eventCallbacks) {
      eventCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in SignalR callback for ${event}:`, error);
        }
      });
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        this.callbacks.clear();
        console.log('SignalR: Disconnected successfully');
      } catch (error) {
        console.error('SignalR: Error during disconnect', error);
      }
    }
  }

  getConnectionState() {
    return this.connection?.state || signalR.HubConnectionState.Disconnected;
  }

  isConnected() {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
export default signalRService;

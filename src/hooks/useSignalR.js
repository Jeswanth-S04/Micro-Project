import { useEffect } from 'react';
import { useAuth } from './useAuth';
import signalRService from '../services/signalrService';

export const useSignalR = (eventName, callback) => {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || !user) return;

    // Initialize SignalR connection
    signalRService.initialize(token, user);

    // Subscribe to the event
    const unsubscribe = signalRService.subscribe(eventName, callback);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [eventName, callback, token, user]);
};

export default useSignalR;

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, Shield } from 'lucide-react';

const SessionIndicator = () => {
  const { user, lastActivity, SESSION_TIMEOUT } = useAppContext();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = SESSION_TIMEOUT - elapsed;
      setTimeRemaining(Math.max(0, remaining));
    };

    // Update immediately
    updateTimer();

    // Update every 30 seconds
    const interval = setInterval(updateTimer, 30000);

    return () => clearInterval(interval);
  }, [user, lastActivity, SESSION_TIMEOUT]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
    
    if (minutesRemaining <= 5) {
      return 'text-red-600';
    } else if (minutesRemaining <= 15) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  };

  if (!user || timeRemaining <= 0) {
    return null;
  }

  const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));

  return (
    <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
      <Shield className="h-4 w-4 text-gray-500" />
      <Clock className={`h-4 w-4 ${getStatusColor()}`} />
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {minutesRemaining > 0 ? `${minutesRemaining}m` : formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default SessionIndicator;

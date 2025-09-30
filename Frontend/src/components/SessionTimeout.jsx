import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, AlertTriangle, LogOut } from 'lucide-react';

const SessionTimeout = () => {
  const { user, lastActivity, SESSION_TIMEOUT, resetSessionTimeout, logout } = useAppContext();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(5 * 60 * 1000); // Show warning 5 minutes before timeout

  useEffect(() => {
    if (!user) {
      setShowWarning(false);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = SESSION_TIMEOUT - elapsed;
      
      setTimeRemaining(Math.max(0, remaining));
      
      // Show warning when 5 minutes or less remain
      if (remaining <= warningTime && remaining > 0) {
        setShowWarning(true);
      } else if (remaining <= 0) {
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity, SESSION_TIMEOUT, warningTime]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStayLoggedIn = () => {
    resetSessionTimeout();
    setShowWarning(false);
  };

  const handleLogoutNow = () => {
    logout();
    setShowWarning(false);
  };

  if (!user || !showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Session Timeout Warning
            </h3>
            <p className="text-sm text-gray-600">
              Your session will expire soon due to inactivity
            </p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-orange-800 font-medium">
              Time remaining: {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogoutNow}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Now</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Click anywhere or perform any action to extend your session
        </p>
      </div>
    </div>
  );
};

export default SessionTimeout;

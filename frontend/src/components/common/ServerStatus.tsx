/**
 * ServerStatus Component
 * Displays the backend server connection status and provides retry functionality
 */
import React, { useState, useEffect } from "react";
import authApi from "../../api/authApi";

interface ServerStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check the server connectivity status
   */
  const checkServerStatus = async (): Promise<void> => {
    setIsChecking(true);
    try {
      const connected = await authApi.checkServerConnectivity();
      setIsConnected(connected);
      if (onStatusChange) {
        onStatusChange(connected);
      }
    } catch {
      setIsConnected(false);
      if (onStatusChange) {
        onStatusChange(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();

    // Set up polling interval to periodically check server status
    const intervalId = setInterval(() => {
      checkServerStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  // If still checking for the first time, show minimal UI
  if (isConnected === null && !isChecking) {
    return null;
  }

  // If server is connected, don't show anything
  if (isConnected && !isChecking) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${isConnected ? "bg-green-100" : "bg-red-100"}`}
    >
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${isChecking ? "bg-yellow-500" : isConnected ? "bg-green-500" : "bg-red-500"}`}
        ></div>
        <span className={isConnected ? "text-green-800" : "text-red-800"}>
          {isChecking
            ? "Checking server connection..."
            : isConnected
              ? "Connected to server"
              : "Server connection failed"}
        </span>
      </div>

      {!isConnected && !isChecking && (
        <div className="mt-2">
          <p className="text-sm text-red-700 mb-2">
            Unable to connect to the backend server. This may result in limited
            functionality.
          </p>
          <button
            onClick={checkServerStatus}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isChecking}
          >
            {isChecking ? "Retrying..." : "Retry Connection"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ServerStatus;

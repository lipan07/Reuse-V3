import React, { createContext, useContext, useState } from 'react';

// Create the context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    // Increment count by 1
    const incrementNotificationCount = () => {
        setNotificationCount(prev => prev + 1);
    };

    // Reset count to 0
    const resetNotificationCount = () => {
        setNotificationCount(0);
    };

    // (Optional) Set count manually
    const setNotificationCountDirect = (count) => {
        setNotificationCount(count);
    };

    return (
        <NotificationContext.Provider
            value={{
                notificationCount,
                incrementNotificationCount,
                resetNotificationCount,
                setNotificationCount: setNotificationCountDirect,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the context
export const useNotification = () => useContext(NotificationContext);

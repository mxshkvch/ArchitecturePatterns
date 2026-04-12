import { useEffect, useState } from 'react';
import { getRecentNotifications, subscribeRecentNotifications } from '../notifications/recentNotifications';

export const useRecentNotifications = () => {
  const [notifications, setNotifications] = useState(() => getRecentNotifications());

  useEffect(() => {
    const unsubscribe = subscribeRecentNotifications((nextNotifications) => {
      setNotifications(nextNotifications);
    });

    return unsubscribe;
  }, []);

  return notifications;
};

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getNotificationStats } from '../services/notificationService';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
    const [stats, setStats] = useState({ total_unread: 0 });
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getNotificationStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching notification stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleClose = () => {
        setShowDropdown(false);
        fetchStats(); // Refresh stats when dropdown closes
    };

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {stats.total_unread > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
                        {stats.total_unread > 99 ? '99+' : stats.total_unread}
                    </span>
                )}
            </button>

            {showDropdown && (
                <NotificationDropdown onClose={handleClose} onUpdate={fetchStats} />
            )}
        </div>
    );
};

export default NotificationBell;

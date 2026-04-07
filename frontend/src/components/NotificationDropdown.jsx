import { useState, useEffect, useRef } from 'react';
import { X, Check, Trash2, Clock, Calendar, Pill, Heart, Bell } from 'lucide-react';
import { fetchNotifications, markAsRead, deleteNotification } from '../services/notificationService';

const NotificationDropdown = ({ onClose, onUpdate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadNotifications();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await fetchNotifications({ limit: 10 });
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            onUpdate();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            onUpdate();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'medicine_reminder':
                return <Pill className="w-5 h-5 text-purple-500" />;
            case 'appointment_reminder':
                return <Calendar className="w-5 h-5 text-blue-500" />;
            case 'follow_up_reminder':
                return <Clock className="w-5 h-5 text-orange-500" />;
            case 'health_check_reminder':
                return <Heart className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <Bell className="w-12 h-12 mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.notification_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDateTime(notification.scheduled_datetime)}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="p-1 hover:bg-green-100 rounded transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4 text-green-600" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="p-1 hover:bg-red-100 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={() => {
                            onClose();
                            // Navigate to full notification page (implement later)
                        }}
                        className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                        View All Notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

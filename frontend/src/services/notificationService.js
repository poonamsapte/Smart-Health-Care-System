import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all notifications for logged-in user
export const fetchNotifications = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.notification_type) params.append('notification_type', filters.notification_type);
        if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const response = await axios.get(
            `${API_URL}/notifications/me?${params.toString()}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Get notification statistics
export const getNotificationStats = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/notifications/stats`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        throw error;
    }
};

// Get upcoming reminders
export const getUpcomingReminders = async (limit = 5) => {
    try {
        const response = await axios.get(
            `${API_URL}/notifications/upcoming?limit=${limit}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching upcoming reminders:', error);
        throw error;
    }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    try {
        const response = await axios.patch(
            `${API_URL}/notifications/${notificationId}/read`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await axios.patch(
            `${API_URL}/notifications/mark-all-read`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking all as read:', error);
        throw error;
    }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/notifications/${notificationId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// Create notification (for doctors/admins)
export const createNotification = async (notificationData) => {
    try {
        const response = await axios.post(
            `${API_URL}/notifications/create`,
            notificationData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

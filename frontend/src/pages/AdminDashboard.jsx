import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, LogOut, Trash2, Menu, X } from 'lucide-react';
import api from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ total_users: 0, total_feedbacks: 0 });
    const [users, setUsers] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin') {
                navigate('/login');
            }
        } catch (e) {
            navigate('/login');
        }

        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const statsRes = await api.get('/admin/stats', { headers });
            setStats(statsRes.data);

            const usersRes = await api.get('/admin/users', { headers });
            setUsers(usersRes.data);

            const feedbackRes = await api.get('/admin/feedbacks', { headers });
            setFeedbacks(feedbackRes.data);

        } catch (error) {
            console.error('Error fetching admin data:', error);
            // Handle unauthorized or other errors (maybe redirect)
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user.");
        }
    };

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;
        try {
            await api.delete(`/admin/feedbacks/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to delete feedback", error);
            alert("Failed to delete feedback.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Chart Data
    const chartData = {
        labels: ['Users', 'Feedbacks'],
        datasets: [
            {
                label: 'Total Count',
                data: [stats.total_users, stats.total_feedbacks],
                backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)'],
                borderColor: ['rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'System Overview',
            },
        },
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white flex flex-col shadow-xl transition-transform duration-300 md:relative md:translate-x-0 md:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 md:p-6 text-2xl font-bold border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Admin</span>
                        <span>Panel</span>
                    </div>
                    <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <ChartBar className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Users</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('feedbacks'); setSidebarOpen(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'feedbacks' ? 'bg-primary text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">Feedbacks</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                <header className="bg-white shadow-sm border-b px-4 md:px-8 py-3 md:py-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        {/* Hamburger - mobile only */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-800 capitalize">{activeTab === 'dashboard' ? 'Overview' : activeTab}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-6 hover:shadow-md transition">
                                            <div className="p-4 bg-primary/10 rounded-xl">
                                                <Users className="w-8 h-8 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                                                <p className="text-3xl font-bold text-gray-800">{stats.total_users}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-6 hover:shadow-md transition">
                                            <div className="p-4 bg-accent/10 rounded-xl">
                                                <MessageSquare className="w-8 h-8 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">Total Feedbacks</p>
                                                <p className="text-3xl font-bold text-gray-800">{stats.total_feedbacks}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-4xl">
                                        <Bar data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="py-4 px-6 font-semibold text-gray-700">ID</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Name</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Email</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Role</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.length > 0 ? users.map((u) => (
                                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-slate-50 transition">
                                                        <td className="py-4 px-6 text-gray-600">{u.id}</td>
                                                        <td className="py-4 px-6 font-medium text-gray-800">{u.full_name}</td>
                                                        <td className="py-4 px-6 text-gray-600">{u.email}</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'doctor' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="py-8 text-center text-gray-500">No users found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'feedbacks' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="py-4 px-6 font-semibold text-gray-700">ID</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Name</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Email</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Message</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700">Date</th>
                                                    <th className="py-4 px-6 font-semibold text-gray-700 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {feedbacks.length > 0 ? feedbacks.map((f) => (
                                                    <tr key={f.id} className="border-b border-gray-50 hover:bg-slate-50 transition">
                                                        <td className="py-4 px-6 text-gray-600">{f.id}</td>
                                                        <td className="py-4 px-6 font-medium text-gray-800">{f.name}</td>
                                                        <td className="py-4 px-6 text-gray-600">{f.email}</td>
                                                        <td className="py-4 px-6 text-gray-600 max-w-xs truncate" title={f.message}>{f.message}</td>
                                                        <td className="py-4 px-6 text-gray-500 text-sm whitespace-nowrap">
                                                            {new Date(f.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button
                                                                onClick={() => handleDeleteFeedback(f.id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete Feedback"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="6" className="py-8 text-center text-gray-500">No feedback found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

// Simple icon for Dashboard since we forgot to import one from lucide-react initially
function ChartBar(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    )
}

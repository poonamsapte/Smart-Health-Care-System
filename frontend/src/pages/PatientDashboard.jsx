import React, { useState, useEffect } from 'react';
import {
    Activity, Calendar, FileText, AlertCircle, CheckCircle,
    Plus, X, Home, Settings, Bell, Search, User, ChevronRight,
    Thermometer, Heart, Clock, Pill, Menu
} from 'lucide-react';
import api from '../services/api';
import NotificationBell from '../components/NotificationBell';
import { getUpcomingReminders } from '../services/notificationService';

export default function PatientDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState({ name: 'Nishant Rao', initial: 'NR' }); // Mock/Placeholder

    // Data States
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [upcomingReminders, setUpcomingReminders] = useState([]);

    // AI Analysis State
    const [symptoms, setSymptoms] = useState('');
    const [aiReport, setAiReport] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Modal State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        doctor_id: '',
        appointment_date: '',
        reason: ''
    });

    useEffect(() => {
        fetchProfile();
        fetchAppointments();
        fetchDoctors();
        fetchUpcomingReminders();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/patient/me');
            if (res.data.user) {
                setUser({
                    name: res.data.user.full_name,
                    initial: res.data.user.full_name.charAt(0).toUpperCase()
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const fetchAppointments = async () => {

        try {
            const res = await api.get('/appointments/');
            console.log(res.data);
            setAppointments(res.data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors/');
            setDoctors(res.data);
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        }
    };

    const fetchUpcomingReminders = async () => {
        try {
            const reminders = await getUpcomingReminders(5);
            setUpcomingReminders(reminders);
        } catch (error) {
            console.error("Failed to fetch reminders", error);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/', {
                ...bookingForm,
                appointment_date: new Date(bookingForm.appointment_date).toISOString()
            });
            setShowBookingModal(false);
            setBookingForm({ doctor_id: '', appointment_date: '', reason: '' });
            alert('Appointment booked successfully!');
            fetchAppointments();
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to book appointment.");
        }
    };

    const analyzeSymptoms = async () => {
        if (!symptoms) return;
        setAnalyzing(true);
        try {
            const response = await api.post('/ai/analyze', { symptoms });
            setAiReport(response.data);
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Failed to analyze symptoms.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-[#1e40af] text-white flex flex-col shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 md:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">SmartHealth</h1>
                            <p className="text-xs text-blue-200">Patient Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={<Home size={20} />}
                        label="Dashboard"
                        active={activeTab === 'overview'}
                        onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<Thermometer size={20} />}
                        label="Health Insights"
                        active={activeTab === 'symptoms'}
                        onClick={() => { setActiveTab('symptoms'); setSidebarOpen(false); }}
                    />
                    <SidebarItem
                        icon={<Calendar size={20} />}
                        label="Appointments"
                        active={activeTab === 'appointments'}
                        onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }}
                        badge={appointments.filter(a => a.status === 'scheduled').length || null}
                    />
                    <SidebarItem
                        icon={<FileText size={20} />}
                        label="Health Records"
                        active={activeTab === 'records'}
                        onClick={() => { setActiveTab('records'); setSidebarOpen(false); }}
                    />
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <div className="bg-blue-800/50 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-blue-200 truncate">Patient ID: #8839</p>
                        </div>
                        <Settings size={18} className="text-blue-300 cursor-pointer hover:text-white" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f3f4f6] min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Hamburger - mobile only */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={22} />
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{getGreeting()}, {user.name.split(' ')[0]}</h2>
                            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Here's what's happening today.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search records, doctors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm w-48 md:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
                            />
                        </div>
                        <NotificationBell />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <DashboardCard
                                    title="Heart Rate"
                                    value="72 bpm"
                                    subtitle="Normal"
                                    icon={<Heart className="text-rose-500" />}
                                    bg="bg-rose-50"
                                />
                                <DashboardCard
                                    title="Blood Pressure"
                                    value="120/80"
                                    subtitle="Optimal"
                                    icon={<Activity className="text-indigo-500" />}
                                    bg="bg-indigo-50"
                                />
                                <DashboardCard
                                    title="Weight"
                                    value="70 kg"
                                    subtitle="-2kg this month"
                                    icon={<User className="text-emerald-500" />}
                                    bg="bg-emerald-50"
                                />
                                <DashboardCard
                                    title="Sleep"
                                    value="7h 30m"
                                    subtitle="Last night"
                                    icon={<Clock className="text-amber-500" />}
                                    bg="bg-amber-50"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Upcoming Appointments */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-800">Upcoming Visits</h3>
                                        <button
                                            onClick={() => setActiveTab('appointments')}
                                            className="text-sm text-indigo-600 font-medium hover:underline flex items-center"
                                        >
                                            View All <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {appointments
                                        .filter(a => a.status === 'scheduled' && (
                                            a.doctor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            a.doctor?.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
                                        ))
                                        .length === 0 ? (
                                        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 text-center">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 mb-4">No upcoming appointments found.</p>
                                            <button
                                                onClick={() => setShowBookingModal(true)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {appointments
                                                .filter(a => a.status === 'scheduled' && (
                                                    a.doctor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    a.doctor?.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
                                                ))
                                                .slice(0, 2).map((appt) => (
                                                    <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">

                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                                Dr
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-800 text-lg">Dr. {appt.doctor?.user?.full_name || appt.doctor?.full_name || 'Doctor'}</h4>
                                                                <p className="text-indigo-600 font-medium">{appt.doctor?.specialization}</p>
                                                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                                    <Calendar size={14} />
                                                                    {new Date(appt.appointment_date).toLocaleDateString()}
                                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                    <Clock size={14} />
                                                                    {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                                            Reschedule
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Upcoming Reminders & Quick Actions */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-800">Upcoming Reminders</h3>
                                    {upcomingReminders.length > 0 ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                            {upcomingReminders.map((reminder) => (
                                                <div key={reminder.id} className="p-4 hover:bg-gray-50 transition">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            {reminder.notification_type === 'medicine_reminder' && <Pill className="w-5 h-5 text-purple-500" />}
                                                            {reminder.notification_type === 'appointment_reminder' && <Calendar className="w-5 h-5 text-blue-500" />}
                                                            {reminder.notification_type === 'follow_up_reminder' && <Clock className="w-5 h-5 text-orange-500" />}
                                                            {reminder.notification_type === 'health_check_reminder' && <Heart className="w-5 h-5 text-red-500" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900">{reminder.title}</p>
                                                            <p className="text-xs text-gray-600 mt-1">{reminder.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(reminder.scheduled_datetime).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                                            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No upcoming reminders</p>
                                        </div>
                                    )}

                                    <h3 className="text-xl font-bold text-gray-800 mt-8">Quick Actions</h3>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                        <button
                                            onClick={() => setActiveTab('symptoms')}
                                            className="w-full p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition flex items-center gap-3 group"
                                        >
                                            <div className="p-3 bg-white rounded-lg text-indigo-600 shadow-sm group-hover:scale-110 transition">
                                                <Thermometer size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-indigo-900">Check Symptoms</p>
                                                <p className="text-xs text-indigo-700">AI-powered health analysis</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setShowBookingModal(true)}
                                            className="w-full p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition flex items-center gap-3 group"
                                        >
                                            <div className="p-3 bg-white rounded-lg text-emerald-600 shadow-sm group-hover:scale-110 transition">
                                                <Plus size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-emerald-900">Book Appointment</p>
                                                <p className="text-xs text-emerald-700">Schedule a visit</p>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="bg-[#1e293b] p-6 rounded-2xl text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                        <h4 className="font-bold text-lg mb-2">Did you know?</h4>
                                        <p className="text-blue-200 text-sm mb-4">Regular hydration boosts energy and brain function.</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-blue-300">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                            Health Tip of the Day
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'appointments' && (
                        <div className="animate-in slide-in-from-right duration-300 max-w-5xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Your Appointments</h2>
                                    <p className="text-gray-500">Manage your visits and history</p>
                                </div>
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    <Plus size={20} /> Book New
                                </button>
                            </div>

                            {appointments.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Appointments Yet</h3>
                                    <p className="text-gray-400">Your scheduled visits will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {appointments.map(appt => (
                                        <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-indigo-100 transition">
                                            <div className="flex items-center gap-6">
                                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-700">
                                                    <span className="text-xs font-bold uppercase">{new Date(appt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-xl font-bold">{new Date(appt.appointment_date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900">Dr. {appt.doctor?.user?.full_name || appt.doctor?.full_name || 'Unknown Doctor'}</h4>
                                                    <p className="text-gray-500">{appt.doctor?.specialization}</p>
                                                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${appt.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                                                    appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SYMPTOMS / AI TAB */}
                    {activeTab === 'symptoms' && (
                        <div className="animate-in slide-in-from-right duration-300 max-w-4xl mx-auto">
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="p-8 border-b border-gray-100 bg-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-indigo-50 rounded-lg">
                                            <Activity className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800">AI Health Assistant</h2>
                                    </div>
                                    <p className="text-gray-500">Describe your symptoms below to get instant insights.</p>
                                </div>

                                <div className="p-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Describe Symptoms</label>
                                    <textarea
                                        className="w-full h-32 p-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none bg-gray-50 text-gray-700 text-lg transition"
                                        placeholder="e.g., I've had a throbbing headache since morning and feel nauseous..."
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                    ></textarea>

                                    <button
                                        onClick={analyzeSymptoms}
                                        disabled={analyzing}
                                        className="mt-6 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center gap-3"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Activity className="animate-spin" /> Analyzing Health Data...
                                            </>
                                        ) : (
                                            <>
                                                <Activity /> Generate Health Report
                                            </>
                                        )}
                                    </button>
                                </div>

                                {aiReport && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-8">
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                            {/* Risk Level Header */}
                                            <div className={`p-4 flex justify-between items-center text-white font-bold ${aiReport.risk_level === 'High' ? 'bg-red-500' :
                                                aiReport.risk_level === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                                                }`}>
                                                <span className="flex items-center gap-2"><Activity /> Analysis Result</span>
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">{aiReport.risk_level} Risk</span>
                                            </div>

                                            <div className="p-6 space-y-8">
                                                {/* Detected Symptoms */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Detected Symptoms</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {aiReport.detected_symptoms.map((s, i) => (
                                                            <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full font-medium">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Conditions */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Potential Conditions</h4>
                                                    <div className="space-y-3">
                                                        {aiReport.predicted_diseases.map((d, i) => (
                                                            <div key={i} className="flex flex-col">
                                                                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                                                                    <span>{d.name}</span>
                                                                    <span>{Math.round(d.confidence * 100)}%</span>
                                                                </div>
                                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.confidence * 100}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Medicines */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Suggested Relief (OTC)</h4>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {aiReport.suggested_medicines.map((med, i) => (
                                                            <div key={i} className="border border-indigo-100 bg-indigo-50/30 p-5 rounded-2xl hover:border-indigo-300 transition-colors">
                                                                <div className="font-bold text-indigo-900 text-lg mb-1">{med.name}</div>
                                                                <div className="text-sm font-medium text-indigo-600 mb-3 bg-white inline-block px-2 py-1 rounded border border-indigo-50">{med.dosage}</div>
                                                                <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                                                                    {med.advice.map((adv, j) => <li key={j}>{adv}</li>)}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Advice */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Medical Advice</h4>
                                                    <ul className="space-y-2">
                                                        {aiReport.recommendations.map((r, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-gray-700 bg-white p-3 rounded-lg border border-gray-100">
                                                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                                                {r}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 p-4 text-xs text-amber-800 border-t border-amber-100 flex gap-2 justify-center">
                                                <AlertCircle size={16} /> {aiReport.disclaimer}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RECORDS TAB */}
                    {activeTab === 'records' && (
                        <HealthRecordsTab />
                    )}

                </div>
            </main>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Book Appointment</h3>
                            <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>

                        <form onSubmit={handleBookAppointment} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Specialist</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                                        value={bookingForm.doctor_id}
                                        onChange={(e) => setBookingForm({ ...bookingForm, doctor_id: e.target.value })}
                                    >
                                        <option value="">Choose a doctor...</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>
                                                Dr. {doc.user?.full_name} ({doc.specialization})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-3.5 text-gray-400 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={bookingForm.appointment_date}
                                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Visit</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="3"
                                    placeholder="Briefly describe your issue..."
                                    value={bookingForm.reason}
                                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                Confirm Appointment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-medium">{label}</span>
            </div>
            {badge && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}

function DashboardCard({ title, value, subtitle, icon, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
            <p className="font-semibold text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
    );
}

// Health Records Tab Component
function HealthRecordsTab() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [recordForm, setRecordForm] = useState({
        record_type: 'symptom_report',
        details: '',
        is_shared_with_doctor: false
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/records');
            setRecords(res.data);
        } catch (error) {
            console.error('Failed to fetch health records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            await api.post('/patient/records', recordForm);
            setShowAddModal(false);
            setRecordForm({ record_type: 'symptom_report', details: '', is_shared_with_doctor: false });
            fetchRecords();
            alert('Health record added successfully!');
        } catch (error) {
            console.error('Failed to add record:', error);
            alert('Failed to add health record.');
        }
    };

    const getRecordIcon = (type) => {
        switch (type) {
            case 'symptom_report':
                return <Thermometer className="w-5 h-5 text-orange-500" />;
            case 'lab_result':
                return <Activity className="w-5 h-5 text-blue-500" />;
            case 'prescription':
                return <Pill className="w-5 h-5 text-purple-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getRecordTypeLabel = (type) => {
        switch (type) {
            case 'symptom_report':
                return 'Symptom Report';
            case 'lab_result':
                return 'Lab Result';
            case 'prescription':
                return 'Prescription Record';
            default:
                return type;
        }
    };

    const getRecordTypeColor = (type) => {
        switch (type) {
            case 'symptom_report':
                return 'bg-orange-100 text-orange-700';
            case 'lab_result':
                return 'bg-blue-100 text-blue-700';
            case 'prescription':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="animate-in slide-in-from-right duration-300 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Health Records</h2>
                    <p className="text-gray-500">Manage your medical history and reports</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} /> Add Record
                </button>
            </div>

            {/* Records List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                    <FileText className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Records Found</h3>
                    <p className="text-gray-400 mb-6">Your lab reports and health records will be listed here.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                    >
                        Add Your First Record
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 p-3 bg-gray-50 rounded-xl">
                                    {getRecordIcon(record.record_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRecordTypeColor(record.record_type)}`}>
                                            {getRecordTypeLabel(record.record_type)}
                                        </span>
                                        {record.is_shared_with_doctor && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                                <CheckCircle size={12} /> Shared with Doctor
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{record.details}</p>
                                    <p className="text-sm text-gray-400 mt-3">
                                        Added on {new Date(record.created_at).toLocaleDateString()} at {new Date(record.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Record Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Add Health Record</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddRecord} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Record Type</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={recordForm.record_type}
                                    onChange={(e) => setRecordForm({ ...recordForm, record_type: e.target.value })}
                                >
                                    <option value="symptom_report">Symptom Report</option>
                                    <option value="lab_result">Lab Result</option>
                                    <option value="prescription">Prescription Record</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Details</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="4"
                                    placeholder="Describe your symptoms, lab results, or medication details..."
                                    value={recordForm.details}
                                    onChange={(e) => setRecordForm({ ...recordForm, details: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="shareWithDoctor"
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    checked={recordForm.is_shared_with_doctor}
                                    onChange={(e) => setRecordForm({ ...recordForm, is_shared_with_doctor: e.target.checked })}
                                />
                                <label htmlFor="shareWithDoctor" className="text-sm text-gray-700 cursor-pointer">
                                    Share this record with my doctor
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

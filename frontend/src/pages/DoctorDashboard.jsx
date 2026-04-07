import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Calendar, Activity, LogOut, Settings,
    Clock, CheckCircle, XCircle, FileText, Heart, Pill
} from 'lucide-react';
import api from '../services/api';
import { createPrescription } from '../services/prescriptionService';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [profileForm, setProfileForm] = useState({
        specialization: '',
        experience_years: 0,
        hospital_affiliation: '',
        consultation_fee: 0,
        license_number: '',
        availability: ''
    });


    useEffect(() => {
        fetchDoctorData();
    }, []);

    const fetchDoctorData = async () => {
        try {
            const [profileRes, statsRes, appointmentsRes] = await Promise.all([
                api.get('/doctors/me'),
                api.get('/doctors/me/stats'),
                api.get('/appointments/')
            ]);

            setProfile(profileRes.data);
            setStats(statsRes.data);
            setAppointments(appointmentsRes.data);

            setProfileForm({
                specialization: profileRes.data.specialization,
                experience_years: profileRes.data.experience_years,
                hospital_affiliation: profileRes.data.hospital_affiliation || '',
                consultation_fee: profileRes.data.consultation_fee,
                license_number: profileRes.data.license_number || '',
                availability: profileRes.data.availability || ''
            });

        } catch (error) {
            console.error('Error fetching doctor data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/doctors/me', profileForm);
            setEditMode(false);
            fetchDoctorData();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleViewRecords = async (patientId) => {
        try {
            const res = await api.get(`/patient/${patientId}/records`);
            const records = res.data;
            if (records.length === 0) {
                alert("No shared records found for this patient.");
            } else {
                // For simplicity, just alert the content or show a basic list
                const recordSummary = records.map(r =>
                    `[${new Date(r.created_at).toLocaleDateString()}] ${r.record_type}: ${r.details}`
                ).join('\n');
                alert(`Patient Records:\n\n${recordSummary}`);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            alert('Failed to fetch patient records (or none shared).');
        }
    };

    const handleAppointmentUpdate = async (appointmentId, status, notes = null) => {

        try {
            const updateData = { status };
            if (notes) updateData.diagnosis_notes = notes;

            await api.put(`/appointments/${appointmentId}`, updateData);
            fetchDoctorData();
            alert('Appointment updated successfully!');
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        }
    };

    const handlePrescribe = (appointment) => {
        setSelectedAppointment(appointment);
        setShowPrescriptionModal(true);
    };

    const handlePrescriptionSubmit = async (appointmentId, patientId, prescriptionData) => {
        try {
            // Validate patientId exists
            if (!patientId) {
                alert('Error: Patient ID is missing. Cannot create prescription.');
                return;
            }

            await createPrescription({
                patient_id: patientId,
                appointment_id: appointmentId,
                ...prescriptionData,
                start_date: new Date().toISOString()
            });
            setShowPrescriptionModal(false);
            setSelectedAppointment(null);
            alert('Prescription created successfully!');
        } catch (error) {
            console.error('Error creating prescription:', error);
            const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
            alert('Failed to create prescription: ' + errorMsg);
        }
    };

    const filterAppointments = (filter) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
            case 'today':
                return appointments.filter(a => {
                    const apptDate = new Date(a.appointment_date);
                    apptDate.setHours(0, 0, 0, 0);
                    return apptDate.getTime() === today.getTime();
                });
            case 'upcoming':
                return appointments.filter(a =>
                    new Date(a.appointment_date) > new Date() && a.status === 'scheduled'
                );
            case 'past':
                return appointments.filter(a =>
                    new Date(a.appointment_date) < new Date() || a.status === 'completed'
                );
            default:
                return appointments;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Welcome, Dr. {profile?.user?.full_name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                        <StatCard
                            icon={<Calendar className="w-6 h-6 text-blue-600" />}
                            title="Total Appointments"
                            value={stats.total_appointments}
                            bgColor="bg-blue-50"
                        />
                        <StatCard
                            icon={<Clock className="w-6 h-6 text-yellow-600" />}
                            title="Pending"
                            value={stats.pending_appointments}
                            bgColor="bg-yellow-50"
                        />
                        <StatCard
                            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                            title="Completed"
                            value={stats.completed_appointments}
                            bgColor="bg-green-50"
                        />
                        <StatCard
                            icon={<XCircle className="w-6 h-6 text-red-600" />}
                            title="Cancelled"
                            value={stats.cancelled_appointments}
                            bgColor="bg-red-50"
                        />
                        <StatCard
                            icon={<Activity className="w-6 h-6 text-purple-600" />}
                            title="Today"
                            value={stats.today_appointments}
                            bgColor="bg-purple-50"
                        />
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <div className="overflow-x-auto">
                            <nav className="flex space-x-8 px-6 whitespace-nowrap" aria-label="Tabs">
                                <TabButton
                                    active={activeTab === 'overview'}
                                    onClick={() => setActiveTab('overview')}
                                    icon={<Activity className="w-5 h-5" />}
                                    label="Overview"
                                />
                                <TabButton
                                    active={activeTab === 'appointments'}
                                    onClick={() => setActiveTab('appointments')}
                                    icon={<Calendar className="w-5 h-5" />}
                                    label="Appointments"
                                />
                                <TabButton
                                    active={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                    icon={<User className="w-5 h-5" />}
                                    label="Profile"
                                />
                            </nav>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Appointments</h2>
                                {filterAppointments('today').length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
                                ) : (
                                    <div className="space-y-4">
                                        {filterAppointments('today').map(appt => (
                                            <AppointmentCard
                                                key={appt.id}
                                                appointment={appt}
                                                onUpdate={handleAppointmentUpdate}
                                                onViewRecords={handleViewRecords}
                                                onPrescribe={handlePrescribe}
                                            />

                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === 'appointments' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">All Appointments</h2>
                                {appointments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No appointments found</p>
                                ) : (
                                    <div className="space-y-4">
                                        {appointments.map(appt => (
                                            <AppointmentCard
                                                key={appt.id}
                                                appointment={appt}
                                                onUpdate={handleAppointmentUpdate}
                                                onViewRecords={handleViewRecords}
                                                onPrescribe={handlePrescribe}
                                            />

                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && profile && (
                            <div className="max-w-2xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                                    >
                                        {editMode ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>

                                {editMode ? (
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                            <input
                                                type="text"
                                                value={profileForm.specialization}
                                                onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                                            <input
                                                type="number"
                                                value={profileForm.experience_years}
                                                onChange={(e) => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Affiliation</label>
                                            <input
                                                type="text"
                                                value={profileForm.hospital_affiliation}
                                                onChange={(e) => setProfileForm({ ...profileForm, hospital_affiliation: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
                                            <input
                                                type="number"
                                                value={profileForm.consultation_fee}
                                                onChange={(e) => setProfileForm({ ...profileForm, consultation_fee: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                            <input
                                                type="text"
                                                value={profileForm.license_number}
                                                onChange={(e) => setProfileForm({ ...profileForm, license_number: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                                            <input
                                                type="text"
                                                value={profileForm.availability}
                                                onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                placeholder="e.g. Mon-Fri 9am-5pm"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Save Changes
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <ProfileField label="Name" value={profile.user?.full_name} />
                                        <ProfileField label="Email" value={profile.user?.email} />
                                        <ProfileField label="Specialization" value={profile.specialization} />
                                        <ProfileField label="Experience" value={`${profile.experience_years} years`} />
                                        <ProfileField label="Hospital" value={profile.hospital_affiliation || 'Not specified'} />
                                        <ProfileField label="Consultation Fee" value={`$${profile.consultation_fee}`} />
                                        <ProfileField label="License Number" value={profile.license_number || 'Not provided'} />
                                        <ProfileField label="Availability" value={profile.availability || 'Not specified'} />

                                        <ProfileField label="Verified" value={profile.is_verified ? 'Yes' : 'No'} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Prescription Modal */}
            {showPrescriptionModal && selectedAppointment && (
                <PrescriptionModal
                    appointment={selectedAppointment}
                    onClose={() => {
                        setShowPrescriptionModal(false);
                        setSelectedAppointment(null);
                    }}
                    onSubmit={handlePrescriptionSubmit}
                />
            )}
        </div>
    );
}

function StatCard({ icon, title, value, bgColor }) {
    return (
        <div className={`${bgColor} rounded-lg p-4 border border-gray-200`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div>{icon}</div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${active
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function AppointmentCard({ appointment, onUpdate, onViewRecords, onPrescribe }) {

    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState(appointment.diagnosis_notes || '');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patient?.full_name || 'Unknown Patient'}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.patient?.email}</p>
                    <p className="text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(appointment.appointment_date)}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                </span>
            </div>

            {appointment.reason && (
                <div className="mb-3">
                    <p className="text-sm text-gray-700">
                        <strong>Reason:</strong> {appointment.reason}
                    </p>
                </div>
            )}

            {appointment.patient && (
                <div className="text-sm text-gray-600 mb-3 flex gap-4">
                    {appointment.patient.gender && <span>Gender: {appointment.patient.gender}</span>}
                    {appointment.patient.blood_group && <span>Blood Group: {appointment.patient.blood_group}</span>}
                    <button
                        onClick={() => onViewRecords(appointment.patient?.id)}
                        className="text-primary hover:underline text-xs ml-auto"
                    >
                        View Shared Records
                    </button>
                </div>

            )}

            {appointment.diagnosis_notes && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Diagnosis Notes:</strong> {appointment.diagnosis_notes}
                    </p>
                </div>
            )}

            {appointment.status === 'scheduled' && (
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                        <FileText className="w-4 h-4 inline mr-1" />
                        {showNotes ? 'Hide Notes' : 'Add Notes'}
                    </button>
                    <button
                        onClick={() => onPrescribe(appointment)}
                        className="flex-1 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
                    >
                        <Pill className="w-4 h-4 inline mr-1" />
                        Prescribe
                    </button>
                    <button
                        onClick={() => onUpdate(appointment.id, 'completed', notes || null)}
                        className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                    >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Mark Complete
                    </button>
                    <button
                        onClick={() => onUpdate(appointment.id, 'cancelled')}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Cancel
                    </button>
                </div>
            )}

            {showNotes && appointment.status === 'scheduled' && (
                <div className="mt-4">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter diagnosis notes..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        rows="3"
                    />
                </div>
            )}
        </div>
    );
}


function PrescriptionModal({ appointment, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        medicine_name: '',
        dosage: '',
        frequency: '',
        duration_days: 7,
        instructions: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(appointment.id, appointment.patient?.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Write Prescription</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Patient:</span> {appointment.patient?.full_name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. Amoxicillin"
                            value={formData.medicine_name}
                            onChange={e => setFormData({ ...formData, medicine_name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. 500mg"
                                value={formData.dosage}
                                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.duration_days}
                                onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.frequency}
                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                            required
                        >
                            <option value="">Select frequency</option>
                            <option value="once daily">Once daily (1x)</option>
                            <option value="twice daily">Twice daily (2x)</option>
                            <option value="3 times daily">3 times daily (3x)</option>
                            <option value="4 times daily">4 times daily (4x)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            rows="3"
                            placeholder="e.g. Take after meals"
                            value={formData.instructions}
                            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
                        >
                            Create Prescription
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProfileField({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
            <span className="text-gray-600 font-medium">{label}:</span>
            <span className="text-gray-900">{value}</span>
        </div>
    );
}


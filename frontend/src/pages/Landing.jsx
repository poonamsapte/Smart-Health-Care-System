import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, User, Activity, Send } from 'lucide-react';
import api from '../services/api';

export default function Landing() {
    const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Sending feedback...' });
        try {
            await api.post('/feedback/', feedback);
            setStatus({ type: 'success', message: 'Thank you for your feedback!' });
            setFeedback({ name: '', email: '', message: '' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error('Feedback error:', error);
            setStatus({ type: 'error', message: 'Failed to send feedback. Please try again.' });
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
                <div className="flex items-center space-x-2">
                    <Heart className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold text-gray-800">SmartHealth</span>
                </div>
                <div className="space-x-4">
                    <Link to="/login" className="px-4 py-2 text-primary font-medium hover:bg-blue-50 rounded-lg transition">Login</Link>
                    <Link to="/register" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition shadow-md">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section with Healthcare Background */}
            <header
                className="relative container mx-auto px-6 py-20 md:py-32 text-center overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.1) 100%), url('/healthcare_hero_bg.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/60 to-cyan-50/80 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 drop-shadow-sm">
                        Your Health, Simplified with <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">AI</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto font-medium">
                        Get early risk analysis, simple appointments, and secure digital records.
                        Empowering you to take control of your well-being.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <Link to="/register" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            Check Your Health Risk
                        </Link>
                        <Link to="/login" className="px-10 py-4 bg-white text-gray-700 text-lg font-semibold border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-300 shadow-lg">
                            Book Appointment
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </header>

            {/* Features Section with Pattern Background */}
            <section
                className="relative py-20"
                style={{
                    backgroundImage: `url('/medical_pattern_bg.png')`,
                    backgroundSize: '400px 400px',
                    backgroundRepeat: 'repeat'
                }}
            >
                {/* Overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-blue-50/90 to-white/95"></div>

                <div className="relative container mx-auto px-6 grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Activity className="w-12 h-12 text-accent" />}
                        title="AI Health Insights"
                        description="Understand potential risks early with our smart symptom analyzer."
                    />
                    <FeatureCard
                        icon={<User className="w-12 h-12 text-secondary" />}
                        title="Easy Appointments"
                        description="Find specialists and book slots instantly without the hassle."
                    />
                    <FeatureCard
                        icon={<Shield className="w-12 h-12 text-primary" />}
                        title="Secure Records"
                        description="Keep your medical history safe and accessible anytime, anywhere."
                    />
                </div>
            </section>

            {/* Feedback Section */}
            <section className="py-20 bg-blue-50">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-5/12 bg-primary p-10 text-white flex flex-col justify-center">
                            <h2 className="text-3xl font-bold mb-4">We Value Your Feedback</h2>
                            <p className="text-blue-100 mb-8 leading-relaxed">
                                Help us improve SmartHealth. Let us know how we can make your healthcare journey even better.
                            </p>
                            <div className="mt-auto opacity-70">
                                <Heart className="w-24 h-24 mb-4" strokeWidth={1} />
                            </div>
                        </div>
                        <div className="md:w-7/12 p-10">
                            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                                {status.message && (
                                    <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                        {status.message}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={feedback.name}
                                            onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={feedback.email}
                                            onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        required
                                        value={feedback.message}
                                        onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 focus:bg-white min-h-[120px] resize-y"
                                        placeholder="Your feedback or suggestions..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={status.type === 'loading'}
                                    className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                    {status.type === 'loading' ? 'Sending...' : 'Send Feedback'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 text-center text-gray-400 border-t border-gray-800">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-center space-x-2 mb-6 opacity-50">
                        <Heart className="w-6 h-6" />
                        <span className="text-xl font-bold">SmartHealth</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Smart Health Care System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="mb-5 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed text-base">{description}</p>
        </div>
    );
}

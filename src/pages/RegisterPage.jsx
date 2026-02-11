import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = () => {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await register(username, email, password, role);
            console.log("Register Result:", result);

            if (result?.user) {
                if (result.session) {
                    // Logged in successfully
                    alert("Registration successful! Logging you in...");
                    navigate('/');
                } else {
                    // User created but no session (maybe verify email?)
                    alert("Registration successful! Please check your email or log in.");
                    navigate('/login');
                }
            } else {
                // Weird case: No error thrown, but no user?
                throw new Error("Registration failed unexpectedly. Please try again.");
            }
        } catch (err) {
            console.error("Register Error:", err);
            // If user already registered, try to login or show specific error
            if (err.message && err.message.includes("already registered")) {
                setError("This email is already registered. Please log in.");
            } else {
                setError(err.message || 'Failed to register');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{t('createAccount')}</h2>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('username')}</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="username123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('emailLabel')}</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('passwordLabel')}</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('iWantToBe')}</label>
                        <div className="mt-2 flex space-x-4">
                            <label className="inline-flex items-center">
                                <input type="radio" className="form-radio text-primary" name="role" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} />
                                <span className="ml-2">{t('student')}</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input type="radio" className="form-radio text-primary" name="role" value="instructor" checked={role === 'instructor'} onChange={(e) => setRole(e.target.value)} />
                                <span className="ml-2">{t('instructor')}</span>
                            </label>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition"
                    >
                        {loading ? t('signingUp') : t('signup')}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    {t('alreadyHaveAccount')} <Link to="/login" className="font-medium text-primary hover:text-secondary">{t('login')}</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

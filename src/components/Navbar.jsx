import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User, BookOpen } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';


const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        console.log("Navbar: Confirm logout clicked");
        await logout();
        console.log("Navbar: Logout finished, closing modal");
        setIsLogoutModalOpen(false);
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
                            <BookOpen className="w-8 h-8 mr-2" />
                            ELearning
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')}`}>
                                {t('home')}
                            </Link>
                            <Link to="/courses" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/courses')}`}>
                                {t('courses')}
                            </Link>
                            {/* Hide 'My Learning' for Instructors, Show for Students/Guests */}
                            {(!user || user.role !== 'instructor') && (
                                <Link to="/my-learning" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/my-learning')}`}>
                                    {t('myLearning')}
                                </Link>
                            )}
                            {/* Only Show Instructor Dashboard for Instructors */}
                            {user && user.role === 'instructor' && (
                                <Link to="/instructor/dashboard" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/instructor/dashboard')}`}>
                                    {t('instructorDashboard')}
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="p-2 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-600 transition-colors flex items-center"
                            title="Switch Language"
                        >
                            {language === 'en' ? '🇺🇸 EN' : '🇹🇭 TH'}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className={`flex items-center space-x-2 text-sm font-medium hover:text-gray-900 ${isActive('/profile') ? 'text-primary' : 'text-gray-700'}`}>
                                    <img src={user.avatar_url || user.avatar} alt="Avatar" className={`h-8 w-8 rounded-full ${isActive('/profile') ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                                    <span className="hidden sm:inline">{user.username || user.email}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    title={t('logout')}
                                >
                                    <LogOut className="h-6 w-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium">{t('login')}</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light font-medium">{t('signup')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={confirmLogout}
                title={t('logout')}
                message={t('logoutConfirm')}
                confirmText={t('logout')}
                cancelText={t('cancel')}
            />
        </nav>
    );
};

export default Navbar;

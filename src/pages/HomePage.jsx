import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { t } = useLanguage();
    const { user } = useAuth(); // Get user from AuthContext

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 overflow-hidden">

            {/* Decorative Avatars */}
            <div className="absolute top-20 left-10 md:left-20 opacity-80 hover:opacity-100 transition-opacity duration-300 animate-bounce-slow hidden md:block">
                <img
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede"
                    alt="Student Avatar"
                    className="w-32 h-32 md:w-48 md:h-48 transform -rotate-12"
                />
            </div>

            <div className="absolute bottom-20 right-10 md:right-20 opacity-80 hover:opacity-100 transition-opacity duration-300 animate-bounce-slow hidden md:block" style={{ animationDelay: '1s' }}>
                <img
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffdfbf"
                    alt="Student Avatar"
                    className="w-32 h-32 md:w-48 md:h-48 transform rotate-12"
                />
            </div>

            <div className="z-10 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-2xl mx-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">{t('welcomeTitle')}</h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 text-center max-w-lg">{t('welcomeSubtitle')}</p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
                    {user ? (
                        user.role === 'instructor' ? (
                            <Link to="/instructor/dashboard" className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-light transition shadow-lg font-bold text-lg text-center transform hover:scale-105 duration-200">
                                {t('instructorDashboard') || 'Go to Instructor Dashboard'}
                            </Link>
                        ) : (
                            <Link to="/courses" className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-light transition shadow-lg font-bold text-lg text-center transform hover:scale-105 duration-200">
                                {t('startLearning') || 'Start Learning'}
                            </Link>
                        )
                    ) : (
                        <>
                            <Link to="/login" className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition shadow-md font-medium text-lg text-center">
                                {t('login')}
                            </Link>
                            <Link to="/register" className="px-8 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-gray-50 transition shadow-md font-medium text-lg text-center">
                                {t('signup')}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

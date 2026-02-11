import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, Filter, BookOpen, Clock, Star } from 'lucide-react';

const CourseCatalog = () => {
    const { courses, enrollCourse } = useCourses();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [enrolling, setEnrolling] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const getCategoryLabel = (category) => {
        const keyMap = {
            'All': 'cat_All',
            'Development': 'cat_Development',
            'Business': 'cat_Business',
            'Design': 'cat_Design',
            'Marketing': 'cat_Marketing',
            'Lifestyle': 'cat_Lifestyle',
            'Photography': 'cat_Photography',
            'Health & Fitness': 'cat_Health_Fitness',
            'Music': 'cat_Music',
            'Academics': 'cat_Academics'
        };
        const key = keyMap[category];
        return key ? t(key) : category;
    };

    const handleEnroll = async (courseId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setEnrolling(courseId);
        try {
            await enrollCourse(courseId, user.id);
            // Show custom modal instead of window.confirm
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Enrollment failed:', error);
            alert('Failed to enroll. Please try again.');
        } finally {
            setEnrolling(null);
        }
    };

    // Filter only published courses
    const publishedCourses = courses.filter(course => course.published);

    const filteredCourses = publishedCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const DEFAULT_CATEGORIES = ['All', 'Development', 'Business', 'Design', 'Marketing'];
    // Dynamically combine defaults with actual used categories
    const categories = Array.from(new Set([
        ...DEFAULT_CATEGORIES,
        ...courses.map(c => c.category).filter(Boolean)
    ]));

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        {t('exploreCourses')}
                    </h1>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                        {t('exploreSubtitle')}
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter className="h-5 w-5 text-gray-500 mr-2 hidden md:block" />
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {getCategoryLabel(category)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <div key={course.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full border border-gray-100">
                                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                                    />
                                </div>
                                <div className="flex-1 p-6 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/20 text-primary mb-2">
                                            {getCategoryLabel(course.category)}
                                        </span>
                                        <div className="flex items-center text-yellow-500 text-sm">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="ml-1 text-gray-600 font-semibold">{course.rating || 'New'}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                        <Link to={`/course/${course.id}`}>
                                            <span className="absolute inset-0" />
                                            {course.title}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                        {course.description}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                                        <div className="flex items-center">
                                            <BookOpen className="w-4 h-4 mr-1" />
                                            <span>{course.lessons.length} Lessons</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span>{course.duration || '2h 15m'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-lg font-bold text-gray-900">${course.price || 'Free'}</span>
                                        <div className="z-10 flex space-x-2">
                                            {user?.role === 'instructor' ? (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded cursor-default border border-gray-200">
                                                    Instructor View
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Check if already enrolled (you might need to fetch this state or pass it down)
                                                        // For now, simple action
                                                        handleEnroll(course.id);
                                                    }}
                                                    disabled={enrolling === course.id}
                                                    className="px-3 py-1 bg-primary text-white text-sm font-medium rounded hover:bg-primary-light transition-colors disabled:opacity-50"
                                                >
                                                    {enrolling === course.id ? t('enrolling') : t('enroll')}
                                                </button>
                                            )}
                                            <Link to={`/course/${course.id}`} className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                View Course &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Modal for Enrollment Success */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{t('enrollmentSuccessTitle')}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t('enrollmentSuccessMessage')}
                        </p>
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={() => navigate('/my-learning')}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                            >
                                {t('startLearningNow')}
                            </button>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                            >
                                {t('browseCourses')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseCatalog;

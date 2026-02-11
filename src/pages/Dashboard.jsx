import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useLanguage } from '../context/LanguageContext';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const { getCoursesByInstructor, deleteCourse } = useCourses();
    const { t } = useLanguage();

    const myCourses = getCoursesByInstructor(user?.id);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            await deleteCourse(id);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
                    <p className="text-gray-600 mt-2">{t('manageCourses')}</p>
                </div>
                <Link to="/instructor/course/new" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-light transition">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {t('createNewCourse')}
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
                    <h3 className="text-lg font-semibold mb-2">{t('totalCourses')}</h3>
                    <p className="text-3xl font-bold text-gray-800">{myCourses.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-secondary">
                    <h3 className="text-lg font-semibold mb-2">{t('totalStudents')}</h3>
                    <p className="text-3xl font-bold text-gray-800">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <h3 className="text-lg font-semibold mb-2">{t('totalEarnings')}</h3>
                    <p className="text-3xl font-bold text-gray-800">$0.00</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('myCourses')}</h2>
            {myCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">{t('noCourses')}</p>
                    <Link to="/instructor/course/new" className="text-primary font-medium hover:underline mt-2 inline-block">{t('startCreating')}</Link>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {myCourses.map((course) => (
                            <li key={course.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img className="h-16 w-16 rounded object-cover mr-4" src={course.thumbnail} alt={course.title} />
                                        <div>
                                            <h3 className="text-lg font-medium text-primary truncate">{course.title}</h3>
                                            <div className="flex items-center mt-1">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {course.published ? t('published') : t('draft')}
                                                </span>
                                                <span className="ml-2 text-sm text-gray-500">{course.lessons.length} {t('lessons')}</span>
                                                <span className="ml-2 text-sm text-gray-500">• {getCategoryLabel(course.category)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Link to={`/instructor/course/${course.id}`} className="text-gray-400 hover:text-gray-500">
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button onClick={() => handleDelete(course.id)} className="text-red-400 hover:text-red-500">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

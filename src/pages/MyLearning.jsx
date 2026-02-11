import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { BookOpen, Clock, Loader2, PlayCircle } from 'lucide-react';

const MyLearning = () => {
    const { user } = useAuth();
    const { getEnrolledCourses } = useCourses();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrollments = async () => {
            console.log("Fetching enrollments for user:", user?.id);
            if (user) {
                try {
                    const data = await getEnrolledCourses(user.id);
                    console.log("Enrolled courses data:", data);
                    setEnrolledCourses(data);
                } catch (error) {
                    console.error("Failed to load enrollments:", error);
                } finally {
                    console.log("Finished fetching enrollments, setting loading to false");
                    setLoading(false);
                }
            } else {
                console.log("No user, setting loading to false");
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [user, getEnrolledCourses]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Please log in to view your courses.</h2>
                <Link to="/login" className="mt-4 inline-block text-primary hover:underline">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>

            {enrolledCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses enrolled</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by browsing our course catalog.</p>
                    <div className="mt-6">
                        <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Browse Courses
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map((course) => (
                        <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100">
                            <div className="relative h-48 w-full">
                                <img
                                    className="h-full w-full object-cover"
                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                                    alt={course.title}
                                />
                                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/20 text-primary">
                                        {course.category || 'General'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 truncate" title={course.title}>
                                    {course.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                    {course.description || 'No description available'}
                                </p>

                                <div className="mt-4">
                                    {/* Progress Bar Placeholder - Can be connected to real progress later */}
                                    {/* <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
                                     </div>
                                     <p className="text-xs text-gray-500 text-right">0% Complete</p> */}
                                </div>

                                <div className="mt-6">
                                    <Link
                                        to={`/course/${course.id}`}
                                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <PlayCircle className="w-4 h-4 mr-2" /> Continue Learning
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLearning;

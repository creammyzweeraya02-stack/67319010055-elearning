import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { PlayCircle, CheckCircle, FileText, Download, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';

const CoursePlayer = () => {
    const { id } = useParams();
    const { getCourseById } = useCourses();
    const [course, setCourse] = useState(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const reviewSectionRef = useRef(null);

    const handleScrollToReview = () => {
        if (reviewSectionRef.current) {
            reviewSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const foundCourse = getCourseById(id);
        if (foundCourse) {
            setCourse(foundCourse);
        }
    }, [id, getCourseById]);

    if (!course) return <div className="text-center mt-20">Loading course...</div>;
    if (!course.lessons || course.lessons.length === 0) return <div className="text-center mt-20">This course has no content yet.</div>;

    const currentLesson = course.lessons[currentLessonIndex];

    const handleNext = () => {
        if (currentLessonIndex < course.lessons.length - 1) {
            setCurrentLessonIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentLessonIndex > 0) {
            setCurrentLessonIndex(prev => prev - 1);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar - Lesson List */}
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto hidden md:block`}>
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 truncate">{course.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{currentLessonIndex + 1} / {course.lessons.length} lessons completed</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${((currentLessonIndex) / course.lessons.length) * 100}%` }}></div>
                    </div>
                </div>
                <div className="py-2">
                    {course.lessons.map((lesson, index) => (
                        <button
                            key={lesson.id}
                            onClick={() => setCurrentLessonIndex(index)}
                            className={`w-full text-left px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${currentLessonIndex === index ? 'bg-primary-light/10 border-r-4 border-primary' : ''}`}
                        >
                            <div className="mt-0.5">
                                {index < currentLessonIndex ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    lesson.type === 'video' ? <PlayCircle className={`w-5 h-5 ${currentLessonIndex === index ? 'text-primary' : 'text-gray-400'}`} /> : <FileText className={`w-5 h-5 ${currentLessonIndex === index ? 'text-primary' : 'text-gray-400'}`} />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${currentLessonIndex === index ? 'text-primary' : 'text-gray-700'}`}>{lesson.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{lesson.duration || '5 min'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="bg-white shadow-sm p-4 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 mr-2 md:block hidden">
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <Link to="/courses" className="text-sm text-gray-500 hover:text-gray-900 flex items-center">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
                        </Link>
                    </div>
                    <div>
                        <button
                            onClick={handleScrollToReview}
                            className="text-sm font-medium text-primary hover:text-indigo-700"
                        >
                            Leave a Review
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video relative mb-6">
                            {currentLesson.type === 'video' ? (
                                <video
                                    src={currentLesson.url}
                                    controls
                                    className="w-full h-full object-contain"
                                    poster={course.thumbnail}
                                    autoPlay
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-500 flex-col p-10 text-center">
                                    <FileText className="w-16 h-16 mb-4 text-gray-300" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">Reading Material</h3>
                                    <p className="max-w-md mx-auto mb-6">Please read the attached content or download the resources.</p>
                                    <a href={currentLesson.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700">
                                        <Download className="w-4 h-4 mr-2" /> Download/View
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentLessonIndex === 0}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentLessonIndex === course.lessons.length - 1}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">About this lesson</h3>
                            <p className="text-gray-600">
                                This lesson covers essential concepts in {course.title}. Make sure to review any attached materials.
                            </p>
                        </div>

                        <div ref={reviewSectionRef}>
                            <ReviewSection courseId={course.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;

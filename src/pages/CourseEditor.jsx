import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash, PlayCircle, FileText, Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CourseEditor = () => {
    const { id } = useParams(); // If id exists, it's edit mode
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getCourseById, addCourse, updateCourse } = useCourses();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [thumbnailOption, setThumbnailOption] = useState('default'); // 'default' | 'upload' | 'url'
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        category: 'Development',
        price: '',
        published: false,
        lessons: []
    });

    const DEFAULT_THUMBNAILS = [
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80', // React/Code
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80', // Design
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80', // Business
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80', // Marketing
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80'  // General
    ];


    // Load course data if editing
    useEffect(() => {
        if (id) {
            const existingCourse = getCourseById(id);
            if (existingCourse) {
                setCourseData(existingCourse);
                // If the thumbnail is not in defaults, assume it's custom/uploaded
                if (!DEFAULT_THUMBNAILS.includes(existingCourse.thumbnail)) {
                    setThumbnailOption('upload');
                }
            } else {
                navigate('/instructor/dashboard'); // Redirect if not found
            }
        }
    }, [id, getCourseById, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLessonChange = (index, field, value) => {
        const newLessons = [...courseData.lessons];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setCourseData(prev => ({ ...prev, lessons: newLessons }));
    };

    const addLesson = () => {
        setCourseData(prev => ({
            ...prev,
            lessons: [...prev.lessons, { id: `l${Date.now()}`, title: 'New Lesson', type: 'video', url: '', duration: '' }]
        }));
    };

    const removeLesson = (index) => {
        const newLessons = courseData.lessons.filter((_, i) => i !== index);
        setCourseData(prev => ({ ...prev, lessons: newLessons }));
    };

    const uploadFile = async (file, bucket) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Failed to upload file: ${error.message}`);
            return null;
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const publicUrl = await uploadFile(file, 'course-thumbnails');
        if (publicUrl) {
            setCourseData(prev => ({ ...prev, thumbnail: publicUrl }));
        }
        setUploading(false);
    };

    const handleLessonFileUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Set a temporary "uploading" state for this lesson if needed, 
        // effectively blocking submit until done. For now just global loading.
        setUploading(true);
        const publicUrl = await uploadFile(file, 'lesson-content');
        if (publicUrl) {
            handleLessonChange(index, 'url', publicUrl);
            // Auto-detect duration/size validation could go here
        }
        setUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updateCourse(id, courseData);
            } else {
                // New course
                // Random thumbnail if empty
                const dataToSave = {
                    ...courseData,
                    thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80'
                };
                await addCourse(dataToSave, user.id);
            }
            navigate('/instructor/dashboard');
        } catch (err) {
            console.error(err);
            alert(`Failed to save course: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 text-black">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">{id ? t('editCourse') : t('createCourse')}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">{t('courseTitle')}</label>
                            <input type="text" name="title" required value={courseData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">{t('courseDescription')}</label>
                            <textarea name="description" rows={3} required value={courseData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('courseCategory')}</label>
                            {/* Category Selection Logic */}
                            {(() => {
                                const STANDARD_CATEGORIES = ['Development', 'Business', 'Design', 'Marketing', 'Lifestyle', 'Photography', 'Health & Fitness', 'Music', 'Academics'];
                                const isCustomCategory = !STANDARD_CATEGORIES.includes(courseData.category) && courseData.category !== '';

                                return (
                                    <div className="space-y-2">
                                        <select
                                            name="category-select"
                                            value={isCustomCategory ? 'custom' : courseData.category}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'custom') {
                                                    // Keep current value if it's already custom, or clear it to start typing
                                                    if (!isCustomCategory) handleChange({ target: { name: 'category', value: '' } });
                                                } else {
                                                    handleChange({ target: { name: 'category', value: val } });
                                                }
                                            }}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
                                        >
                                            <option value="custom">อื่นๆ (Other)</option>
                                            <option disabled>──────────</option>
                                            {STANDARD_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>

                                        {(isCustomCategory || courseData.category === '') && (
                                            <input
                                                type="text"
                                                name="category"
                                                value={courseData.category}
                                                onChange={handleChange}
                                                placeholder="ระบุหมวดหมู่ของคุณ..."
                                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm animate-fade-in-down"
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('coursePrice')}</label>
                            <input type="number" name="price" value={courseData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm" placeholder="0.00" />
                        </div>

                        {/* Thumbnail Section */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('courseThumbnail')}</label>

                            <div className="flex space-x-4 mb-4">
                                <button type="button" onClick={() => setThumbnailOption('default')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${thumbnailOption === 'default' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
                                    {t('defaults')}
                                </button>
                                <button type="button" onClick={() => setThumbnailOption('upload')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${thumbnailOption === 'upload' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
                                    {t('uploadImage')}
                                </button>
                                <button type="button" onClick={() => setThumbnailOption('url')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${thumbnailOption === 'url' ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'}`}>
                                    {t('imageUrl')}
                                </button>
                            </div>

                            {thumbnailOption === 'default' && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {DEFAULT_THUMBNAILS.map((url, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setCourseData(prev => ({ ...prev, thumbnail: url }))}
                                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${courseData.thumbnail === url ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={url} alt={`Default ${index + 1}`} className="w-full h-24 object-cover" />
                                            {courseData.thumbnail === url && (
                                                <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center">
                                                    <div className="bg-white rounded-full p-1">
                                                        <Plus className="w-4 h-4 text-primary" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {thumbnailOption === 'upload' && (
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer relative">
                                    {uploading ? (
                                        <div className="space-y-1 text-center">
                                            <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                                            <div className="flex text-sm text-gray-600">
                                                <span>Uploading...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label htmlFor="thumbnail-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input id="thumbnail-upload" name="thumbnail-upload" type="file" className="sr-only" accept="image/*" onChange={handleThumbnailUpload} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {thumbnailOption === 'url' && (
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input type="text" name="thumbnail" value={courseData.thumbnail} onChange={handleChange} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-primary focus:border-primary sm:text-sm border-gray-300" placeholder="https://..." />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        <Upload className="w-4 h-4 mr-1" /> URL
                                    </span>
                                </div>
                            )}

                            {/* Preview */}
                            {courseData.thumbnail && (
                                <div className="mt-4 relative inline-block group">
                                    <p className="text-xs text-gray-500 mb-1">Current Thumbnail:</p>
                                    <img src={courseData.thumbnail} alt="Preview" className="h-40 w-auto object-cover rounded-md border border-gray-200" />
                                </div>
                            )}
                        </div>

                        <div className="col-span-2">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input id="published" name="published" type="checkbox" checked={courseData.published} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="published" className="font-medium text-gray-700">{t('publishCourse')}</label>
                                    <p className="text-gray-500">{t('publishDescription')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Curriculum Section */}
                    <div className="mt-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{t('courseCurriculum')}</h3>
                            <button type="button" onClick={addLesson} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary-light/20 hover:bg-primary-light/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <Plus className="mr-1 h-4 w-4" /> {t('addLesson')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {courseData.lessons.length === 0 && <p className="text-gray-500 italic text-sm">No lessons added yet.</p>}
                            {courseData.lessons.map((lesson, index) => (
                                <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative group">
                                    <button type="button" onClick={() => removeLesson(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                        <div className="sm:col-span-1 flex items-center justify-center">
                                            <span className="h-8 w-8 rounded-full bg-primary-light/20 text-primary flex items-center justify-center font-bold text-sm">{index + 1}</span>
                                        </div>
                                        <div className="sm:col-span-4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('lessonTitle')}</label>
                                            <input type="text" placeholder={t('lessonTitle')} value={lesson.title} onChange={(e) => handleLessonChange(index, 'title', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('lessonType')}</label>
                                            <select value={lesson.type} onChange={(e) => handleLessonChange(index, 'type', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                                                <option value="video">{t('video')}</option>
                                                <option value="text">{t('textArticle')}</option>
                                                <option value="pdf">{t('pdfResource')}</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-5">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('lessonContent')} ({lesson.type})</label>
                                            <div className="flex space-x-2">
                                                <input type="text" placeholder="File URL or Upload" value={lesson.url} onChange={(e) => handleLessonChange(index, 'url', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm flex-1" />
                                                <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                                    <Upload className="h-4 w-4 text-gray-500" />
                                                    <input type="file" className="sr-only" onChange={(e) => handleLessonFileUpload(index, e)} />
                                                </label>
                                            </div>
                                            {lesson.url && (
                                                <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary mt-1 hover:underline truncate block">
                                                    View Resource
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200 flex justify-end">
                        <button type="button" onClick={() => navigate('/instructor/dashboard')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3">
                            {t('cancel')}
                        </button>
                        <button type="submit" disabled={loading || uploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading || uploading ? (
                                <span className="flex items-center">
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    {t('saving')}
                                </span>
                            ) : (
                                t('saveCourse')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEditor;

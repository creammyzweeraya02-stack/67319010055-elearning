import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);

export const CourseProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Fetch courses from Supabase
    const fetchCourses = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*, lessons(*)')
                .eq('published', true);

            if (error) throw error;

            if (data) {
                const formattedCourses = data.map(course => ({
                    ...course,
                    instructorId: course.instructor_id,
                    lessons: course.lessons || []
                }));
                setCourses(formattedCourses);
            }
        } catch (err) {
            console.error('Unexpected error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const refreshCourses = useCallback(async () => {
        console.log("refreshCourses: Fetching updated course list...");
        const { data, error } = await supabase
            .from('courses')
            .select('*, lessons(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('refreshCourses: Error fetching courses:', error);
            return;
        }

        if (data) {
            console.log("refreshCourses: Fetched", data.length, "courses.");
            const formattedCourses = data.map(course => ({
                ...course,
                instructorId: course.instructor_id,
                lessons: course.lessons || []
            }));
            setCourses(formattedCourses);
        }
    }, []);

    const getCourseById = useCallback((id) => {
        return courses.find(course => course.id.toString() === id.toString());
    }, [courses]);

    const getCoursesByInstructor = useCallback((instructorId) => {
        if (!instructorId) return [];
        return courses.filter(course => course.instructorId === instructorId);
    }, [courses]);

    const addCourse = useCallback(async (courseData, userId) => {
        if (!userId) {
            console.error("addCourse: User ID is missing!");
            throw new Error("User ID is missing!");
        }

        try {
            console.log("addCourse: Starting save process for user:", userId);
            console.log("addCourse: Course Data:", courseData);

            // 1. Verify Profile exists
            console.log("addCourse: Checking if profile exists in public.profiles...");
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (profileError) {
                console.error("addCourse: Profile check error:", profileError);
            } else {
                console.log("addCourse: Profile check result:", profile ? "Found" : "Not Found");
            }

            if (!profile) {
                console.warn("addCourse: Profile not found. Attempting fallback creation...");
                const { error: createProfileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        role: 'instructor',
                        email: user?.email || '',
                        username: user?.user_metadata?.username || user?.email || 'User'
                    });

                if (createProfileError) {
                    console.error("addCourse: Fallback profile creation failed:", createProfileError);
                    throw new Error("Cannot save course: Instructor profile is missing and could not be created.");
                }
                console.log("addCourse: Fallback profile created successfully.");
            }

            // 2. Insert Course
            console.log("addCourse: Inserting course record...");
            const { data: newCourse, error: courseError } = await supabase
                .from('courses')
                .insert([{
                    title: courseData.title,
                    description: courseData.description,
                    category: courseData.category,
                    price: parseFloat(courseData.price) || 0,
                    thumbnail: courseData.thumbnail,
                    instructor_id: userId,
                    published: courseData.published
                }])
                .select()
                .single();

            if (courseError) {
                console.error("addCourse: Course insert error:", courseError);
                throw courseError;
            }

            console.log("addCourse: Course record created successfully. ID:", newCourse.id);

            // 3. Insert Lessons (if any)
            if (courseData.lessons && courseData.lessons.length > 0) {
                console.log("addCourse: Inserting lessons...", courseData.lessons.length);
                const lessonsToInsert = courseData.lessons.map((lesson, index) => ({
                    course_id: newCourse.id,
                    title: lesson.title,
                    type: lesson.type,
                    url: lesson.url,
                    duration: lesson.duration || '0:00',
                    "order": index + 1
                }));

                const { error: lessonError } = await supabase
                    .from('lessons')
                    .insert(lessonsToInsert);

                if (lessonError) {
                    console.error("addCourse: Lesson insert error:", lessonError);
                    throw lessonError;
                }
                console.log("addCourse: Lessons inserted successfully.");
            } else {
                console.log("addCourse: No lessons to insert.");
            }

            console.log("addCourse: Refreshing course list...");
            await refreshCourses();
            console.log("addCourse: Save process completed successfully.");
            return newCourse;
        } catch (error) {
            console.error('addCourse: CRITICAL ERROR:', error);
            throw error;
        }
    }, [refreshCourses, user]);

    const updateCourse = useCallback(async (id, updates) => {
        try {
            console.log("Updating course:", id, updates);

            // 1. Update Course Details
            const { error: courseError } = await supabase
                .from('courses')
                .update({
                    title: updates.title,
                    description: updates.description,
                    category: updates.category,
                    price: parseFloat(updates.price) || 0,
                    thumbnail: updates.thumbnail,
                    published: updates.published
                })
                .eq('id', id);

            if (courseError) {
                console.error("Course update error:", courseError);
                throw courseError;
            }

            // 2. Handle Lessons (Upsert Strategy)
            if (updates.lessons) {
                console.log("Managing lessons for course:", id);
                const validUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const incomingLessonIds = updates.lessons
                    .filter(l => validUuidPattern.test(l.id))
                    .map(l => l.id);

                const { data: existingLessons } = await supabase
                    .from('lessons')
                    .select('id')
                    .eq('course_id', id);

                const existingIds = existingLessons ? existingLessons.map(l => l.id) : [];
                const idsToDelete = existingIds.filter(dbId => !incomingLessonIds.includes(dbId));

                if (idsToDelete.length > 0) {
                    console.log("Deleting removed lessons:", idsToDelete);
                    const { error: deleteError } = await supabase
                        .from('lessons')
                        .delete()
                        .in('id', idsToDelete);
                    if (deleteError) {
                        console.error("Lesson delete error:", deleteError);
                        throw deleteError;
                    }
                }

                const lessonsToUpsert = updates.lessons.map((lesson, index) => {
                    const isNew = !validUuidPattern.test(lesson.id);
                    return {
                        id: isNew ? undefined : lesson.id,
                        course_id: id,
                        title: lesson.title,
                        type: lesson.type,
                        url: lesson.url,
                        duration: lesson.duration || '0:00',
                        "order": index + 1
                    };
                });

                console.log("Upserting lessons:", lessonsToUpsert.length);
                const { error: lessonError } = await supabase
                    .from('lessons')
                    .upsert(lessonsToUpsert);

                if (lessonError) {
                    console.error("Lesson upsert error:", lessonError);
                    throw lessonError;
                }
            }

            console.log("Course update successful.");
            await refreshCourses();
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    }, [refreshCourses]);

    const deleteCourse = useCallback(async (id) => {
        try {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) throw error;
            await refreshCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }, [refreshCourses]);

    const enrollCourse = useCallback(async (courseId, userId) => {
        if (!userId) return false;
        try {
            const { error } = await supabase
                .from('enrollments')
                .insert([{ user_id: userId, course_id: courseId }]);

            if (error) {
                if (error.code === '23505') return true; // Already enrolled
                throw error;
            }
            return true;
        } catch (error) {
            console.error('Error enrolling in course:', error);
            throw error;
        }
    }, []);

    const isEnrolled = useCallback(async (courseId, userId) => {
        if (!userId) return false;

        const { data } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .maybeSingle();

        return !!data;
    }, []);

    const getEnrolledCourses = useCallback(async (userId) => {
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
                    course_id,
                    progress,
                    courses (
                        *,
                        lessons (count)
                    )
                `)
                .eq('user_id', userId);

            if (error) throw error;

            if (data) {
                return data.map(item => {
                    if (!item.courses) return null;
                    return {
                        ...item.courses,
                        progress: item.progress,
                        totalLessons: item.courses.lessons?.[0]?.count || 0
                    };
                }).filter(Boolean);
            }
        } catch (error) {
            console.error('Error in getEnrolledCourses:', error);
        }
        return [];
    }, []);

    const value = {
        courses,
        getCourseById,
        getCoursesByInstructor,
        addCourse,
        updateCourse,
        deleteCourse,
        loading,
        enrollCourse,
        isEnrolled,
        getEnrolledCourses
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourses = () => useContext(CourseContext);

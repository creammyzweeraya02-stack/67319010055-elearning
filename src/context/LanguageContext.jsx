import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    // Default to 'en' (English)
    const [language, setLanguage] = useState('th');

    // Translation Dictionary
    const translations = {
        en: {
            // Navbar
            home: "Home",
            courses: "Courses",
            myLearning: "My Learning",
            instructorDashboard: "Instructor Dashboard",
            login: "Log in",
            signup: "Sign up",
            logout: "Logout",
            profile: "Profile",

            // Home Page
            welcomeTitle: "Welcome to ELearning Platform",
            welcomeSubtitle: "Learn anything, anywhere.",
            startLearning: "Start Learning",
            becomeInstructor: "Become an Instructor",
            roleDescription: "Choose your role to get started:",
            studentRole: "I want to learn",
            instructorRole: "I want to teach",

            // Course Catalog
            searchPlaceholder: "Search courses...",
            allCategories: "All Categories",
            enroll: "Enroll",
            enrolling: "Enrolling...",
            enrolled: "Enrolled",
            enrollmentSuccessTitle: "Enrollment Successful! 🎉",
            enrollmentSuccessMessage: "You have successfully enrolled in this course. Would you like to start learning now?",
            startLearningNow: "Start Learning Now",
            browseCourses: "Browse More Courses",
            courseDetails: "Course Details",
            exploreCourses: "Explore Courses",
            exploreSubtitle: "Discover new skills and advance your career with our top-rated courses.",
            // Categories
            cat_All: "All",
            cat_Development: "Development",
            cat_Business: "Business",
            cat_Design: "Design",
            cat_Marketing: "Marketing",
            cat_Lifestyle: "Lifestyle",
            cat_Photography: "Photography",
            cat_Health_Fitness: "Health & Fitness",
            cat_Music: "Music",
            cat_Academics: "Academics",

            // Profile Page
            userProfile: "User Profile",
            editProfile: "Edit Profile",
            saveChanges: "Save Changes",
            cancel: "Cancel",
            fullName: "Full Name",
            email: "Email Address",
            role: "Role",
            changeAvatar: "Change",
            chooseAvatar: "Choose an Avatar",
            customUrl: "Or enter a custom Image URL",
            preview: "Preview",
            back: "Back",

            // Dashboard
            dashboardTitle: "Instructor Dashboard",
            manageCourses: "Manage your courses and track performance.",
            createNewCourse: "Create New Course",
            totalCourses: "Total Courses",
            totalStudents: "Total Students",
            pendingReviews: "Pending Reviews",
            totalEarnings: "Total Earnings",
            myCourses: "My Courses",
            noCourses: "You haven't created any courses yet.",
            startCreating: "Get started by creating one!",
            published: "Published",
            draft: "Draft",
            lessons: "Lessons",
            // Editor
            editCourse: "Edit Course",
            createCourse: "Create New Course",
            courseTitle: "Course Title",
            courseDescription: "Description",
            courseCategory: "Category",
            coursePrice: "Price ($)",
            courseThumbnail: "Course Thumbnail",
            defaults: "Defaults",
            uploadImage: "Upload Image",
            imageUrl: "Image URL",
            publishCourse: "Publish this course",
            publishDescription: "Published courses are visible to students.",
            courseCurriculum: "Course Curriculum",
            addLesson: "Add Lesson",
            lessonTitle: "Lesson Title",
            lessonType: "Type",
            lessonContent: "Content",
            video: "Video",
            textArticle: "Text/Article",
            pdfResource: "PDF Resource",
            saving: "Saving...",
            saveCourse: "Save Course",

            // Auth
            emailLabel: "Email address",
            usernameLabel: "Username or Email",
            username: "Username",
            passwordLabel: "Password",
            nameLabel: "Full Name",
            confirmPasswordLabel: "Confirm Password",
            createAccount: "Create Account",
            iWantToBe: "I want to be a:",
            student: "Student",
            instructor: "Instructor",
            signingUp: "Creating Account...",
            alreadyHaveAccount: "Already have an account?",
            loggingIn: "Logging in...",
            dontHaveAccount: "Don't have an account?",

            // Common
            loading: "Loading...",
            success: "Success",
            error: "Error",
        },
        th: {
            // Navbar
            home: "หน้าหลัก",
            courses: "คอร์สเรียน",
            myLearning: "คอร์สของฉัน",
            instructorDashboard: "แดชบอร์ดผู้สอน",
            login: "เข้าสู่ระบบ",
            signup: "ลงทะเบียน",
            logout: "ออกจากระบบ",
            logoutConfirm: "คุณแน่ใจว่าต้องการออกจากระบบใช่หรือไม่?",
            profile: "โปรไฟล์",

            // Home Page
            welcomeTitle: "ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้",
            welcomeSubtitle: "เรียนรู้ได้ทุกที่ ทุกเวลา",
            startLearning: "เริ่มเรียนเลย",
            becomeInstructor: "สมัครเป็นผู้สอน",
            roleDescription: "เลือกสถานะของคุณเพื่อเริ่มต้น:",
            studentRole: "ฉันต้องการเรียน",
            instructorRole: "ฉันต้องการสอน",

            // Course Catalog
            searchPlaceholder: "ค้นหาคอร์ส...",
            allCategories: "ทุกหมวดหมู่",
            enroll: "ลงทะเบียน",
            enrolling: "กำลังลงทะเบียน...",
            enrolled: "มีในคลังแล้ว",
            enrollmentSuccessTitle: "ลงทะเบียนสำเร็จ! 🎉",
            enrollmentSuccessMessage: "คุณได้ลงทะเบียนในคอร์สนี้แล้ว คุณต้องการเริ่มเรียนเลยหรือไม่?",
            startLearningNow: "เริ่มเรียนเลย",
            browseCourses: "ดูคอร์สอื่นๆ",
            courseDetails: "รายละเอียดคอร์ส",
            exploreCourses: "คอร์สเรียนทั้งหมด",
            exploreSubtitle: "ค้นพบทักษะใหม่ๆ และพัฒนาอาชีพของคุณด้วยคอร์สเรียนคุณภาพจากเรา",
            // Categories
            cat_All: "ทั้งหมด",
            cat_Development: "การเขียนโปรแกรม",
            cat_Business: "ธุรกิจ",
            cat_Design: "การออกแบบ",
            cat_Marketing: "การตลาด",
            cat_Lifestyle: "ไลฟ์สไตล์",
            cat_Photography: "การถ่ายภาพ",
            cat_Health_Fitness: "สุขภาพ",
            cat_Music: "ดนตรี",
            cat_Academics: "วิชาการ",

            // Profile Page
            userProfile: "โปรไฟล์ผู้ใช้",
            editProfile: "แก้ไขโปรไฟล์",
            saveChanges: "บันทึกการเปลี่ยนแปลง",
            cancel: "ยกเลิก",
            fullName: "ชื่อ-นามสกุล",
            email: "อีเมล",
            role: "สถานะ",
            changeAvatar: "เปลี่ยนรูป",
            chooseAvatar: "เลือกรูปแทนตัว",
            customUrl: "หรือใส่ลิงก์รูปภาพเอง",
            preview: "ตัวอย่าง",
            back: "กลับ",

            // Dashboard
            dashboardTitle: "แดชบอร์ดผู้สอน",
            manageCourses: "จัดการคอร์สเรียนและติดตามผลงานของคุณ",
            createNewCourse: "สร้างคอร์สใหม่",
            totalCourses: "คอร์สทั้งหมด",
            totalStudents: "นักเรียนทั้งหมด",
            pendingReviews: "รอตรวจสอบรีวิว",
            totalEarnings: "รายได้ทั้งหมด",
            myCourses: "คอร์สของฉัน",
            noCourses: "คุณยังไม่ได้สร้างคอร์สเรียนเลย",
            startCreating: "เริ่มต้นสร้างคอร์สเลย!",
            published: "เผยแพร่แล้ว",
            draft: "ร่าง",
            lessons: "บทเรียน",
            // Editor
            editCourse: "แก้ไขคอร์ส",
            createCourse: "สร้างคอร์สใหม่",
            courseTitle: "ชื่อคอร์ส",
            courseDescription: "รายละเอียด",
            courseCategory: "หมวดหมู่",
            coursePrice: "ราคา ($)",
            courseThumbnail: "รูปปกคอร์ส",
            defaults: "รูปมาตรฐาน",
            uploadImage: "อัปโหลดรูป",
            imageUrl: "ลิงก์รูปภาพ",
            publishCourse: "เผยแพร่คอร์สนี้",
            publishDescription: "คอร์สที่เผยแพร่จะแสดงให้นักเรียนเห็น",
            courseCurriculum: "เนื้อหาบทเรียน",
            addLesson: "เพิ่มบทเรียน",
            lessonTitle: "ชื่อบทเรียน",
            lessonType: "ประเภท",
            lessonContent: "เนื้อหา",
            video: "วิดีโอ",
            textArticle: "บทความ",
            pdfResource: "เอกสาร PDF",
            saving: "กำลังบันทึก...",
            saveCourse: "บันทึกคอร์ส",

            // Auth
            emailLabel: "อีเมล",
            usernameLabel: "ชื่อผู้ใช้ หรือ อีเมล",
            username: "ชื่อผู้ใช้",
            passwordLabel: "รหัสผ่าน",
            nameLabel: "ชื่อ-นามสกุล",
            confirmPasswordLabel: "ยืนยันรหัสผ่าน",
            createAccount: "สร้างบัญชีใหม่",
            iWantToBe: "ฉันต้องการสมัครเป็น:",
            student: "นักเรียน",
            instructor: "ผู้สอน",
            signingUp: "กำลังสร้างบัญชี...",
            alreadyHaveAccount: "มีบัญชีผู้ใช้แล้ว?",
            loggingIn: "กำลังเข้าสู่ระบบ...",
            dontHaveAccount: "ยังไม่มีบัญชีผู้ใช้?",

            // Common
            loading: "กำลังโหลด...",
            success: "สำเร็จ",
            error: "เกิดข้อผิดพลาด",
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'th' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

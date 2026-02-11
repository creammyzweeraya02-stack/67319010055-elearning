export const courses = [
    {
        id: 'c1',
        title: 'Introduction to React',
        description: 'Learn the basics of React from scratch.',
        instructorId: 'u2',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
        duration: '5h 30m',
        rating: 4.8,
        reviews: 120,
        price: 49.99,
        category: 'Development',
        published: true,
        lessons: [
            { id: 'l1', title: 'What is React?', duration: '10:00', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
            { id: 'l2', title: 'Components', duration: '15:00', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ]
    },
    {
        id: 'c2',
        title: 'Advanced Tailwind CSS',
        description: 'Master utility-first CSS framework.',
        instructorId: 'u2',
        thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
        duration: '3h 15m',
        rating: 4.6,
        reviews: 85,
        price: 39.99,
        category: 'Design',
        published: true,
        lessons: []
    }
];

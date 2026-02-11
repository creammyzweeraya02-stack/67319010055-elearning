export const users = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        password: 'password123', // In real app, this would be hashed
    },
    {
        id: 'u2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'instructor',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        password: 'password123',
    },
];

export const currentUser = null; // Default state

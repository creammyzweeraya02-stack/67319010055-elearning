import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
    const { user, updateUser, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    // const [name, setName] = useState(user?.full_name || user?.name || ''); // Removed full_name
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!user) return <div className="flex justify-center items-center h-screen">Please log in to view your profile.</div>;

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updates = {
                // full_name: name, // Removed
                // email, // Email updates usually require verification, skipping for now unless AuthContext handles it specifically
                avatar_url: avatarUrl
            };
            if (password) updates.password = password;

            await updateUser(updates);
            setMessage(t('success') || 'Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
            setMessage(error.message || error.error_description || t('error') || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Generate 20 preset avatars using DiceBear
    const presetAvatars = Array.from({ length: 20 }, (_, i) => `https://api.dicebear.com/7.x/notionists/svg?seed=Avatar${i}&backgroundColor=b6e3f4,c0aede,d1d4f9`);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-primary px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/')} className="text-white hover:text-gray-200 transition-colors" title={t('back')}>
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold text-white flex items-center">
                            {t('userProfile')}
                        </h3>
                    </div>

                </div>

                <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 mb-10">
                        <div className="relative group">
                            <img
                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
                                src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                alt="User avatar"
                            />
                            {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-medium">{t('change') || 'Change'}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl font-bold text-gray-900">{user.username}</h2>
                            <p className="text-gray-500 mb-2">{user.email}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'instructor' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                            </span>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 mb-6 rounded-lg flex items-center ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message}
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-8 animate-fadeIn">
                            {/* Avatar Selection */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-4">{t('chooseAvatar') || 'Choose an Avatar'}</label>
                                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 mb-6">
                                    {presetAvatars.map((url, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setAvatarUrl(url)}
                                            className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-110 focus:outline-none ${avatarUrl === url ? 'border-primary ring-2 ring-primary ring-opacity-50 scale-110' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('customImageUrl') || 'Or enter a custom Image URL'}</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="url"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="https://example.com/my-avatar.png"
                                        className="flex-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    />
                                </div>
                                {avatarUrl && (
                                    <div className="mt-4 flex items-center space-x-3">
                                        <span className="text-sm text-gray-500">{t('preview') || 'Preview'}:</span>
                                        <img src={avatarUrl} alt="Preview" className="h-12 w-12 rounded-full border border-gray-300 bg-white" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">{t('username') || 'Username'}</label>
                                    <input type="text" value={user.username} disabled className="mt-1 bg-gray-100 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border cursor-not-allowed" />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">{t('emailLabel') || 'Email address'}</label>
                                    <input type="email" value={email} disabled className="mt-1 bg-gray-100 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border cursor-not-allowed" />
                                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed directly.</p>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">{t('newPassword') || 'New Password'} <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border" placeholder="Leave blank to keep current" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{t('cancel') || 'Cancel'}</button>
                                <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors">
                                    {loading ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="border-t border-gray-200 pt-8">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{t('username') || 'Username'}</dt>
                                    <dd className="mt-1 text-sm text-gray-900 font-medium">{user.username}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{t('emailLabel') || 'Email'}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">{t('role') || 'Role'}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
                                </div>
                            </dl>
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                                    {t('editProfile') || 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

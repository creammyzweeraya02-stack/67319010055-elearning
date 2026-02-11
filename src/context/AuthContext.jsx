import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout to prevent infinite loading
        const timer = setTimeout(() => {
            console.warn('Auth check timed out');
            setLoading(false);
        }, 5000);

        // Check active session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) console.error('Session error:', error);

                if (session?.user) {
                    await fetchProfile(session.user);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Auth init error:', err);
                setLoading(false);
            }
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            }

            if (data) {
                setUser({ ...authUser, ...data });
            } else {
                // Fallback: use metadata if profile fetch failed
                setUser({
                    ...authUser,
                    role: authUser.user_metadata?.role || 'student',
                    username: authUser.user_metadata?.username,
                    avatar_url: authUser.user_metadata?.avatar_url
                });
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            // Fallback even on crash
            setUser(authUser);
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier, password) => {
        let emailToLogin = identifier;

        // If not an email, try to find email by username
        if (!identifier.includes('@')) {
            const { data, error } = await supabase
                .from('profiles')
                .select('email')
                .eq('username', identifier)
                .single();

            if (error || !data) {
                console.error("Username lookup failed:", error);
                throw new Error("Username not found");
            }
            emailToLogin = data.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailToLogin,
            password,
        });

        if (error) throw error;
        return data;
    };

    const register = async (username, email, password, role = 'student') => {
        // Sign up with metadata directly
        const cleanUsername = username.trim();
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        console.log("Registering:", cleanUsername, cleanEmail);

        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
            options: {
                data: {
                    username: cleanUsername,
                    role: role,
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&background=random`
                }
            }
        });

        if (error) {
            console.error("Registration Error:", error);
            throw error;
        }

        // If we have a session immediately (ideal case)
        if (data?.session) {
            console.log("Registration successful, session created.");
            // Fetch profile immediately to ensure UI is ready
            await fetchProfile(data.user);
            return data;
        }

        // Force manual check if session didn't update automatically
        if (data?.user && !data.session) {
            console.log("User created but no session. Attempting manual login...");
            // In some cases (like email confirm disabled), session might be null initially
            // We can try to sign in immediately to get the session
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPassword,
            });

            if (loginError) {
                console.warn("Manual login after registration failed:", loginError);
                // Return original data so user knows account was created at least
                return data;
            }

            if (loginData?.session) {
                console.log("Manual login successful.");
                await fetchProfile(loginData.user);
                return loginData;
            }
        }

        return data;
    };

    const logout = async () => {
        console.log("AuthContext: Logout called");
        setLoading(true);
        try {
            console.log("AuthContext: Calling supabase.auth.signOut()...");
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("AuthContext: SignOut Error from value:", error);
                throw error;
            }
            console.log("AuthContext: SignOut successful");
        } catch (error) {
            console.error("AuthContext: Logout Exception:", error);
        } finally {
            console.log("AuthContext: Cleaning up local state...");
            // Always clear local state regardless of server error
            setUser(null);
            setLoading(false);
            // Clear any potential legacy items
            localStorage.removeItem('supabase.auth.token');
            console.log("AuthContext: Local state cleared");
        }
    };

    const updateUser = async (updates) => {
        try {
            const updatesWithId = {
                id: user.id,
                ...updates,
            };

            // 1. Update Profile in public.profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updatesWithId);

            if (profileError) {
                console.error("Supabase Profile Update Error:", profileError);
                throw profileError;
            }

            // 2. Update Password in Auth (if provided)
            if (updates.password) {
                const { error: authError } = await supabase.auth.updateUser({
                    password: updates.password
                });
                if (authError) {
                    console.error("Supabase Auth Password Update Error:", authError);
                    throw authError;
                }
            }

            // Update local state
            setUser(prev => ({ ...prev, ...updates }));
            return { ...user, ...updates };
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

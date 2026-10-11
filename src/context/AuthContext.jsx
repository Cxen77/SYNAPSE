import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken, getAccessToken, refreshAccessToken } from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseClient';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AuthPromptModal from '../components/common/AuthPromptModal';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Load: Try silent refresh to restore session
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Use shared refreshAccessToken so it participates in the same lock
                // as the axios interceptor — prevents two simultaneous /auth/refresh calls
                console.log("[AuthContext] Attempting silent refresh payload on boot...");
                // Race against a 5s timeout so guests aren't stuck on a loader
                await Promise.race([
                    refreshAccessToken(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Boot timeout')), 5000)
                    )
                ]);
                console.log("[AuthContext] Silent refresh success. Requesting /users/me...");

                // Now use the api instance (with token) to fetch user profile
                // Add _skipAuthRedirect to prevent the interceptor from immediately
                // kicking the user out if this specific check 401s
                const { data: userData } = await api.get('/users/me', { _skipAuthRedirect: true });
                console.log("[AuthContext] /users/me fetched successfully:", userData.email);
                setCurrentUser(userData);
            } catch (error) {
                console.error("[AuthContext] Boot session failed:", error.message || error);
                // No valid session — user browses as guest (this is expected)
                setAccessToken(null);
                setCurrentUser(null);
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    // Signup (no token issued — requires email verification)
    const signup = async (formData, captchaToken) => {
        const { data } = await api.post('/auth/signup', { ...formData, captchaToken });
        return data;
    };

    // Verify OTP — issues access token + refresh cookie
    const verifyOtp = async (email, otp, captchaToken) => {
        const { data } = await api.post('/auth/verify-email', { email, otp, captchaToken });
        setAccessToken(data.accessToken);
        setCurrentUser(data);
        return data;
    };

    // Login — issues access token + refresh cookie
    const login = async (email, password, captchaToken) => {
        const { data } = await api.post('/auth/login', { email, password, captchaToken });
        setAccessToken(data.accessToken);
        setCurrentUser(data);
        return data;
    };

    // Google Login — issues access token + refresh cookie
    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        const { data } = await api.post('/auth/google', { token: idToken });
        setAccessToken(data.accessToken);
        setCurrentUser(data);
        return data;
    };

    // Forgot Password
    const forgotPassword = async (email, captchaToken) => {
        const { data } = await api.post('/auth/forgot-password', { email, captchaToken });
        return data;
    };

    // Reset Password
    const resetPassword = async (token, newPassword, captchaToken) => {
        const { data } = await api.post('/auth/reset-password', { token, newPassword, captchaToken });
        return data;
    };

    // Logout current session
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout errors
        }
        setAccessToken(null);
        setCurrentUser(null);
    };

    // Logout all sessions
    const logoutAll = async () => {
        try {
            await api.post('/auth/logout-all');
        } catch (error) {
            // Ignore errors
        }
        setAccessToken(null);
        setCurrentUser(null);
    };

    const [authModalConfig, setAuthModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    const openAuthModal = (title, message) => {
        setAuthModalConfig({
            isOpen: true,
            title: title || "Don't miss what's happening",
            message: message || "Sign in or create an account to like, comment, and connect on Synapse.",
        });
    };

    const closeAuthModal = () => {
        setAuthModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // Helper: checks if user is authenticated; if yes, runs action; if no, pops auth modal
    const requireAuth = (action, actionName = 'interact') => {
        if (currentUser?._id) {
            return typeof action === 'function' ? action() : true;
        }
        const actionMessages = {
            like: { title: "Log in to like posts", message: "Sign in to like posts, react to updates, and support creators." },
            comment: { title: "Log in to comment", message: "Join the conversation on Synapse by signing in to reply." },
            post: { title: "Sign in to post", message: "Share your thoughts, hackathons, and projects with the community." },
            team: { title: "Sign in to join teams", message: "Collaborate with talented peers and build projects together." },
            event: { title: "Sign in to register", message: "Get your digital event pass and match with teammates." },
            chat: { title: "Sign in to chat", message: "Connect in real-time with teammates and community members." },
            follow: { title: "Sign in to follow", message: "Stay updated with creators, organizers, and friends." },
        };
        const config = actionMessages[actionName] || {
            title: "Sign in to continue",
            message: "Create an account or log in to interact on Synapse."
        };
        openAuthModal(config.title, config.message);
        return false;
    };

    const value = {
        currentUser,
        signup,
        verifyOtp,
        login,
        googleLogin,
        forgotPassword,
        resetPassword,
        logout,
        logoutAll,
        loading,
        openAuthModal,
        closeAuthModal,
        requireAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            <AuthPromptModal
                isOpen={authModalConfig.isOpen}
                onClose={closeAuthModal}
                title={authModalConfig.title}
                message={authModalConfig.message}
            />
        </AuthContext.Provider>
    );
};

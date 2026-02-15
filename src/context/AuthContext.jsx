import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseClient'; // Import Firebase Auth
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import Google Auth

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Load: Check for token
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/users/me');
                    setCurrentUser(data);
                } catch (error) {
                    console.error("Failed to load user", error);
                    logout(); // Token invalid
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    // Signup
    const signup = async (formData, captchaToken) => {
        const { data } = await api.post('/auth/signup', { ...formData, captchaToken });
        return data; // returns { requiresVerification: true, email: ... }
    };

    // Verify OTP
    const verifyOtp = async (email, otp, captchaToken) => {
        const { data } = await api.post('/auth/verify-email', { email, otp, captchaToken });
        localStorage.setItem('token', data.token);
        setCurrentUser(data);
        return data;
    };

    // Login
    const login = async (email, password, captchaToken) => {
        const { data } = await api.post('/auth/login', { email, password, captchaToken });
        localStorage.setItem('token', data.token);
        setCurrentUser(data);
        return data;
    };

    // Google Login
    const googleLogin = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        // Exchange Firebase ID Token for Backend JWT
        const { data } = await api.post('/auth/google', { token: idToken });
        localStorage.setItem('token', data.token);
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

    // Logout
    const logout = async () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore logout errors
        }
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
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

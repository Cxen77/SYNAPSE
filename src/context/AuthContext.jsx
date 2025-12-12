import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseClient';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Signup with Email/Password
    const signup = async (email, password, name, username) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            username: username,
            email: email,
            profilePic: "",
            createdAt: serverTimestamp(),
            authProvider: "email"
        });

        return user;
    };

    // Login with Email/Password
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    // Google Login - fast, no Firestore
    const googleLogin = async () => {
        console.log("🔵 Starting Google Sign-In...");
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Signed in!");
        return result.user;
    };

    // Logout
    const logout = () => {
        return signOut(auth);
    };

    // Reset Password
    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch MongoDB user data
                    // We need to ensure the token is ready for the interceptor
                    const token = await user.getIdToken();
                    // The axios interceptor will attach the token
                    // We might need a specific endpoint to get "me" or just use the user sync logic
                    // For now, let's assume we can hit a profile endpoint or similar if it exists
                    // Or we can rely on the fact that the backend creates the user if missing on protected routes
                    // But we need the _id for the frontend.

                    // Let's try to fetch the user profile from our backend
                    // If the user is new, this might fail if we don't have a "create if not exists" on GET /me
                    // But our protect middleware does that!
                    // So let's add a route for getting current user details if not already present, 
                    // or just use an existing one.
                    // Looking at userRoutes.js, there isn't a specific "me" route, but we can add one or use search?
                    // Actually, let's just use the firebase user for now and rely on the backend to handle the mapping
                    // BUT, the frontend needs _id for comparisons (isMember, etc).

                    // Let's add a simple fetch to a new endpoint or existing one.
                    // Since I can't easily add a new endpoint without editing backend again (which I can do),
                    // I will update userRoutes.js to include a /me endpoint or similar.
                    // Wait, I can just use the user search or update profile? No.

                    // Let's use the existing /users/profile endpoint
                    const res = await api.get('/users/profile');
                    // MERGE CAREFULLY: Do not use spread {...user} as it strips Firebase prototype methods (getIdToken)
                    // Instead, mutate the user object or use Object.assign to preserve the prototype chain
                    const mergedUser = Object.assign(user, res.data);
                    setCurrentUser(mergedUser);
                } catch (error) {
                    console.error("Failed to fetch MongoDB user", error);
                    setCurrentUser(user); // Fallback to just Firebase user
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        googleLogin,
        logout,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
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

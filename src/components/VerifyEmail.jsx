import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

const VerifyEmail = () => {
    const { currentUser } = useAuth();
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser?.emailVerified) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleResendEmail = async () => {
        setSending(true);
        try {
            await sendEmailVerification(currentUser);
            toast.success("Verification email sent!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send verification email.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
                <p className="text-gray-600 mb-6">
                    We've sent a verification email to <span className="font-semibold text-gray-900">{currentUser?.email}</span>.
                    Please check your inbox and follow the link to verify your account.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200"
                    >
                        I've verified my email
                    </button>

                    <button
                        onClick={handleResendEmail}
                        disabled={sending}
                        className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                    >
                        {sending ? "Sending..." : "Resend Verification Email"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;

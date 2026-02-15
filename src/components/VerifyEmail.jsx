import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, ArrowRight } from 'lucide-react';
import TurnstileWidget from './TurnstileWidget';
import api from '../api/axios'; // Direct API call for resend

const VerifyEmail = () => {
    const { verifyOtp, currentUser } = useAuth();
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else if (currentUser?.email) {
            setEmail(currentUser.email);
        }
    }, [location, currentUser]);

    useEffect(() => {
        if (currentUser?.isEmailVerified) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!captchaToken) {
            toast.error("Please complete the CAPTCHA.");
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(email, otp, captchaToken);
            toast.success("Email verified successfully!");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Verification failed. Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => { /* Implement Resend Logic later if needed, currently not in core prompt but good UX */
        /* For now just show toast */
        toast("Resend feature coming soon. Please check your spam folder.", { icon: 'ℹ️' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
                <p className="text-gray-600 mb-6">
                    Enter the 6-digit code sent to <span className="font-semibold text-gray-900">{email || "your email"}</span>.
                </p>

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                    <input
                        type="text"
                        maxLength="6"
                        className="w-full text-center text-2xl font-bold tracking-widest px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />

                    <TurnstileWidget onVerify={setCaptchaToken} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition duration-200 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="mt-4">
                    <button
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                        Resend Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;

import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import TurnstileWidget from "./TurnstileWidget";

const PasswordStrengthMeter = ({ password }) => {
  const checks = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[\W_]/.test(password),
  }), [password]);

  const score = Object.values(checks).filter(Boolean).length;
  const percent = (score / 5) * 100;
  const color = score <= 1 ? "bg-red-500" : score <= 3 ? "bg-yellow-500" : score === 4 ? "bg-blue-500" : "bg-emerald-500";
  const label = score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Strong" : "Very Strong";

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-500 min-w-[64px] text-right">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {[
          ["8+ characters", checks.length],
          ["Uppercase", checks.upper],
          ["Lowercase", checks.lower],
          ["Number", checks.number],
          ["Special char", checks.special],
        ].map(([text, ok]) => (
          <span key={text} className={`text-[11px] flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-gray-400"}`}>
            <span className={`inline-block w-1 h-1 rounded-full ${ok ? "bg-emerald-500" : "bg-gray-300"}`} />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    course: "",
    year: "",
    bio: "",
    skills: [],
    socials: {}
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();

  // No cleanup needed — tokens are in memory now
  useEffect(() => { }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    try {
      await signup(formData, captchaToken);
      toast.success("Account created! Please verify your email.");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account.");
      setCaptchaToken("");
      setCaptchaResetKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await googleLogin();
      toast.success("Signed up with Google!");
      navigate("/");
    } catch (err) {
      toast.error("Google signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8 sm:py-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Subtle decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4 shadow-md shadow-blue-600/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join Synapse and connect with your network</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center mb-5">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSignup}>
            {/* Name & Username side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  name="username"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full px-4 py-2.5 pr-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-sm"
                placeholder="Min 8 chars, mixed case + number"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <TurnstileWidget
              key={captchaResetKey}
              onVerify={setCaptchaToken}
              onError={() => setError("Captcha Failed")}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400 uppercase tracking-wider">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full py-2.5 flex items-center justify-center gap-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm shadow-sm"
          >
            <FaGoogle className="text-red-500" />
            Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from '@/fuseon-web/shims/router';
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import TurnstileWidget from "./TurnstileWidget";
import Logo from "../assets/logo";
import { Button } from "@/components/ui/button";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password, captchaToken);
      toast.success("Logged in successfully!");

      // Strict role-based redirect
      const role = data?.role || 'user';
      if (role === 'admin') navigate("/admin");
      else if (role === 'moderator') navigate("/moderator");
      else if (role === 'organizer') navigate("/organizer");
      else navigate("/");

    } catch (err) {
      if (err.response?.status === 403) {
        setError("Email not verified. Please verify your email.");
      } else {
        setError(err.response?.data?.message || "Login failed. Invalid credentials.");
      }
      setCaptchaToken("");
      setCaptchaResetKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await googleLogin();
      toast.success("Logged in with Google!");
      navigate(user?.onboarded === false ? '/onboarding' : '/');
    } catch (err) {
      setError('Could not continue with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fuseon-login">
      <div className="login-content">
        <div className="login-brand">
          <img src={Logo} alt="" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold">Fuseon</span>
        </div>

        <header className="login-heading">
          <h1 className="text-[32px] leading-[1.2] font-bold">Welcome back.</h1>
          <p className="mt-3 text-[15px] leading-6 text-muted-foreground">Good to see you again. Sign in to your account.</p>
        </header>

        {error && <p role="alert" className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Email address</label>
            <input id="login-email" type="email" inputMode="email" className="login-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium">Password</label>
            <div className="relative">
              <input id="login-password" type={showPassword ? "text" : "password"} className="login-input pr-14" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
              <Button type="button" variant="ghost" size="icon" className="login-password-toggle absolute right-1 top-1 h-11 w-11 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
            <div className="mt-3 text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
            </div>
          </div>

          <TurnstileWidget key={captchaResetKey} onVerify={setCaptchaToken} />
          <Button type="submit" disabled={loading} className="login-submit h-[52px] w-full rounded-lg text-[15px] shadow-none">
            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Signing in…</> : <>Sign in <FaArrowRight /></>}
          </Button>
        </form>

        <div className="my-7 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-border" /><span className="text-sm text-muted-foreground">or</span><span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" disabled={loading} onClick={handleGoogleLogin} className="login-google h-[52px] w-full rounded-lg text-[15px] shadow-none">
          <FaGoogle />Continue with Google
        </Button>

        <p className="login-signup text-center text-sm text-muted-foreground">
          New to Fuseon? <Link to="/signup" className="font-semibold text-primary hover:underline">Create account</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;

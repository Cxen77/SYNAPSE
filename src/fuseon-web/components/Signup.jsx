import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash, FaGoogle, FaCheck, FaLock, FaEnvelope } from 'react-icons/fa';
import communityImage from '@/assets/signup-community.jpg';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from '@/fuseon-web/shims/router';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo';
import TurnstileWidget from './TurnstileWidget';
import AccountQuestions from './AccountQuestions';
import { emptyProfile, profileReady } from './account-options';

const headings = [
  ['Join Fuseon.', 'Start with your email.'],
  ['Set your password.', 'Make it yours. Keep it secure.'],
  ['What’s your name?', 'Choose how you appear on Fuseon.'],
  ['What interests you?', 'Which events would you love to be part of?'],
  ['What do you enjoy building?', 'Add your role and skills. You can change these later.'],
];

export default function Signup() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const ready = step === 0 ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) : step === 1 ? password.length >= 8 : step === 2 ? profileReady(profile) : step === 3 ? profile.interests.length > 0 : true;

  const next = async (e) => {
    e.preventDefault();
    if (!ready || loading) return;
    setError('');
    if (step < 4) { setStep(step + 1); return; }
    if (!captchaToken) { setError('Please try again in a moment.'); return; }
    setLoading(true);
    try {
      const data = await signup({ ...profile, email: email.trim(), password, completeOnboarding: true }, captchaToken);
      // Only the mock API issues a session here. A real API may require verification.
      navigate(data?.accessToken ? '/' : '/verify-email', { replace: true, state: { email: email.trim() } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.');
    } finally { setLoading(false); }
  };
  const google = async () => {
    setLoading(true); setError('');
    try { await googleLogin('signup'); navigate('/onboarding', { replace: true }); }
    catch { setError('Could not continue with Google. Please try again.'); }
    finally { setLoading(false); }
  };

  return <main className="fuseon-login account-screen signup-screen"><div className="login-content account-content">
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" aria-label="Back" title="Back" disabled={loading} onClick={() => { setError(''); step > 0 ? setStep(step - 1) : navigate('/login'); }}><FaArrowLeft /></Button>
      <div className="login-brand"><img src={Logo} alt="" className="h-7 w-7 object-contain" /><span className="text-lg font-bold">Fuseon</span></div>
      <span className="w-9 text-right text-xs text-muted-foreground">{step + 1}/5</span>
    </div>
    <div className="signup-progress" role="progressbar" aria-label="Account setup" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1}>{headings.map((_, i) => <span key={i} className={i <= step ? 'is-complete' : ''} />)}</div>
    {step === 0 && <img src={communityImage} width={1152} height={576} alt="Students collaborating at a campus hackathon" className="signup-community" />}
    <header className="login-heading"><h1 className="text-[30px] font-bold leading-[1.2]">{headings[step][0]}</h1><p className="mt-2 text-[15px] leading-6 text-muted-foreground">{headings[step][1]}</p></header>
    {error && <p role="alert" className="mb-5 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    <form onSubmit={next} className="flex flex-1 flex-col">
      <div key={step} className="account-step">
        {step === 0 && <div><label htmlFor="signup-email" className="mb-2 block text-sm font-medium">Email address</label><div className="relative"><FaEnvelope className="signup-input-icon" aria-hidden="true" /><input id="signup-email" type="email" inputMode="email" autoComplete="email" className="login-input signup-icon-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>}
        {step === 1 && <div><div className="signup-security"><FaLock /><span className="break-all">{email}</span></div><label htmlFor="signup-password" className="mb-2 block text-sm font-medium">Password</label><div className="relative"><input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="login-input pr-14" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-11 w-11" aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</Button></div><div className="signup-password-meter" aria-hidden="true">{[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].map((valid, i) => <span key={i} className={valid ? 'is-complete' : ''} />)}</div><p className={`mt-3 flex items-center gap-2 text-xs ${password.length >= 8 ? 'text-primary' : 'text-muted-foreground'}`}><FaCheck />At least 8 characters.</p></div>}
        {step >= 2 && <AccountQuestions step={step - 2} value={profile} onChange={setProfile} />}
      </div>
      <TurnstileWidget onVerify={setCaptchaToken} />
      <div className="account-actions">
        <Button type="submit" disabled={!ready || loading} className="login-submit h-[52px] w-full rounded-lg shadow-none">{loading ? 'Creating account…' : step === 4 ? 'Create account' : 'Continue'}{!loading && <FaArrowRight />}</Button>
        {step === 0 && <><div className="my-5 flex items-center gap-4" aria-hidden="true"><span className="h-px flex-1 bg-border" /><span className="text-sm text-muted-foreground">or</span><span className="h-px flex-1 bg-border" /></div><Button type="button" variant="outline" disabled={loading} onClick={google} className="login-google h-[52px] w-full rounded-lg shadow-none"><FaGoogle />Continue with Google</Button><p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary">Sign in</Link></p></>}
        {step === 4 && <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">By creating an account, you agree to Fuseon’s Terms of Service and Privacy Policy.</p>}
      </div>
    </form>
  </div></main>;
}

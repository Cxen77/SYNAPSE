import React, { useEffect, useState } from 'react';
import { Link } from '@/fuseon-web/shims/router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '../assets/logo';
import TurnstileWidget from './TurnstileWidget';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { forgotPassword } = useAuth();
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const send = async (e) => {
    e?.preventDefault();
    if (loading || cooldown) return;
    setError('');
    if (!captchaToken) { setError('Please try again in a moment.'); return; }
    setLoading(true);
    try { await forgotPassword(email.trim(), captchaToken); setSent(true); setCooldown(30); }
    catch { setError('Could not send the link. Check your connection and try again.'); }
    finally { setLoading(false); }
  };
  return <main className="fuseon-login account-screen"><div className="login-content account-content">
    <div className="flex items-center justify-between"><Button asChild variant="ghost" size="icon"><Link to="/login" aria-label="Back to sign in" title="Back to sign in"><ArrowLeft /></Link></Button><div className="login-brand"><img src={Logo} alt="" className="h-7 w-7 object-contain" /><span className="text-lg font-bold">Fuseon</span></div><span className="w-9" /></div>
    <header className="login-heading">{sent && <MailCheck className="mb-5 h-8 w-8 text-primary" />}<h1 className="text-[30px] font-bold leading-[1.2]">{sent ? 'Check your email.' : 'Forgot your password?'}</h1><p className="mt-3 text-[15px] leading-6 text-muted-foreground">{sent ? <>If an account exists for <strong className="break-all text-foreground">{email.trim()}</strong>, you’ll receive a link to reset your password.</> : 'Enter the email you use for Fuseon. We’ll send you a reset link.'}</p></header>
    {error && <p role="alert" className="mb-5 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
    <TurnstileWidget onVerify={setCaptchaToken} />
    {sent ? <div className="flex flex-1 flex-col" aria-live="polite"><p className="text-sm leading-6 text-muted-foreground">Open the link in your email to choose a new password. If it doesn’t arrive, check your spam folder.</p><Button variant="link" className="mt-3 justify-start px-0" onClick={() => { setSent(false); setCooldown(0); setError(''); }}>Use a different email</Button><div className="account-actions"><Button variant="outline" className="login-google h-[52px] w-full rounded-lg shadow-none" onClick={send} disabled={loading || cooldown > 0}>{loading ? 'Sending…' : cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}</Button><Button asChild className="login-submit mt-3 h-[52px] w-full rounded-lg shadow-none"><Link to="/login">Back to sign in <ArrowRight /></Link></Button><div className="mt-6 border-t border-border pt-4"><p className="text-center text-xs leading-5 text-muted-foreground">This preview doesn’t send emails or change real passwords.</p><Button asChild variant="link" className="mt-1 w-full"><Link to="/reset-password?token=demo-recovery">Preview the reset screen</Link></Button></div></div></div> : <form onSubmit={send} className="flex flex-1 flex-col"><div><label htmlFor="recovery-email" className="mb-2 block text-sm font-medium">Email address</label><input id="recovery-email" type="email" inputMode="email" autoComplete="email" className="login-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div><div className="account-actions"><Button type="submit" disabled={loading || !email.trim()} className="login-submit h-[52px] w-full rounded-lg shadow-none">{loading ? 'Sending…' : 'Send reset link'}{!loading && <ArrowRight />}</Button><p className="mt-5 text-center text-sm text-muted-foreground">Remember your password? <Link to="/login" className="font-semibold text-primary">Sign in</Link></p></div></form>}
  </div></main>;
}

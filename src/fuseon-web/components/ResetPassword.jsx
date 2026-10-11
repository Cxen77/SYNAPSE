import React, { useState } from 'react';
import { useSearchParams, Link } from '@/fuseon-web/shims/router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '../assets/logo';
import TurnstileWidget from './TurnstileWidget';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const mismatch = confirm && password !== confirm;
  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!token || password.length < 8 || mismatch || loading) return;
    if (!captchaToken) { setError('Please try again in a moment.'); return; }
    setLoading(true);
    try { await resetPassword(token, password, captchaToken); setPassword(''); setConfirm(''); setComplete(true); }
    catch { setError('This link may have expired. Request a new link and try again.'); }
    finally { setLoading(false); }
  };
  const field = (id, label, value, change, visible, reveal) => <div><label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label><div className="relative"><input id={id} className="login-input pr-14" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder={id === 'new-password' ? 'At least 8 characters' : 'Enter it again'} value={value} onChange={e => change(e.target.value)} required minLength={8} aria-invalid={id === 'confirm-password' && Boolean(mismatch)} aria-describedby={id === 'confirm-password' && mismatch ? 'password-mismatch' : undefined} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-11 w-11" onClick={() => reveal(!visible)} title={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}>{visible ? <EyeOff /> : <Eye />}</Button></div></div>;
  return <main className="fuseon-login account-screen"><div className="login-content account-content"><div className="flex items-center justify-between"><Button asChild variant="ghost" size="icon"><Link to="/login" aria-label="Back to sign in" title="Back to sign in"><ArrowLeft /></Link></Button><div className="login-brand"><img src={Logo} alt="" className="h-7 w-7 object-contain" /><span className="text-lg font-bold">Fuseon</span></div><span className="w-9" /></div>
    <header className="login-heading">{complete && <CheckCircle className="mb-5 h-8 w-8 text-primary" />}<h1 className="text-[30px] font-bold leading-[1.2]">{!token ? 'Request a new link.' : complete ? 'You’re all set.' : 'Choose a new password.'}</h1><p className="mt-3 text-[15px] leading-6 text-muted-foreground">{!token ? 'This reset link is missing or invalid. Request a new one to continue.' : complete ? 'Your password reset is complete in this preview. You can return to sign in.' : 'Use at least 8 characters and a password you haven’t used before.'}</p></header>
    {error && <p role="alert" className="mb-4 text-sm text-destructive">{error} <Link to="/forgot-password" className="underline">Request a new link</Link></p>}
    {!token || complete ? <div className="account-actions"><Button asChild className="login-submit h-[52px] w-full rounded-lg shadow-none"><Link to={complete ? '/login' : '/forgot-password'}>{complete ? 'Back to sign in' : 'Request reset link'}<ArrowRight /></Link></Button></div> : <form onSubmit={submit} className="flex flex-1 flex-col"><div className="space-y-5">{field('new-password','New password',password,setPassword,show,setShow)}{field('confirm-password','Confirm password',confirm,setConfirm,showConfirm,setShowConfirm)}{mismatch && <p id="password-mismatch" role="alert" className="text-sm text-destructive">Passwords don’t match.</p>}</div><TurnstileWidget onVerify={setCaptchaToken} /><div className="account-actions"><Button type="submit" disabled={loading || password.length < 8 || !confirm || Boolean(mismatch)} className="login-submit h-[52px] w-full rounded-lg shadow-none">{loading ? 'Resetting…' : 'Reset password'}{!loading && <ArrowRight />}</Button><p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Preview only — no real password is changed.</p></div></form>}
  </div></main>;
}

import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import Logo from '../assets/logo';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from '@/fuseon-web/shims/router';
import AccountQuestions from './AccountQuestions';
import { emptyProfile, profileReady } from './account-options';

const headings = [ ['What’s your name?', 'Choose how you appear on Fuseon.'], ['What interests you?', 'Which events would you love to be part of?'], ['What do you enjoy building?', 'Add your role and skills. You can change these later.'] ];
export default function Onboarding() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(() => ({ ...emptyProfile(), name: currentUser?.name || '', username: currentUser?.username || '' }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!currentUser) return <Navigate to="/login" replace />;
  const ready = step === 0 ? profileReady(profile) : step === 1 ? profile.interests.length > 0 : true;
  const next = async (e) => {
    e.preventDefault();
    if (!ready || saving) return;
    if (step < 2) { setStep(step + 1); return; }
    setSaving(true); setError('');
    try { const { data } = await api.put('/users/onboarding', profile); setCurrentUser(data); navigate('/', { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'Could not save your preferences. Please try again.'); }
    finally { setSaving(false); }
  };
  return <main className="fuseon-login account-screen"><div className="login-content account-content">
    <div className="flex items-center justify-between"><div className="w-9">{step > 0 && <Button type="button" variant="ghost" size="icon" title="Back" aria-label="Back" disabled={saving} onClick={() => setStep(step - 1)}><FaArrowLeft /></Button>}</div><div className="login-brand"><img src={Logo} alt="" className="h-7 w-7 object-contain" /><span className="text-lg font-bold">Fuseon</span></div><span className="w-9 text-right text-xs text-muted-foreground">{step + 1}/3</span></div>
    <header className="login-heading"><h1 className="text-[30px] font-bold leading-[1.2]">{headings[step][0]}</h1><p className="mt-3 text-[15px] leading-6 text-muted-foreground">{headings[step][1]}</p></header>
    {error && <p role="alert" className="mb-5 text-sm text-destructive">{error}</p>}
    <form onSubmit={next} className="flex flex-1 flex-col"><div key={step} className="account-step"><AccountQuestions step={step} value={profile} onChange={setProfile} /></div><div className="account-actions"><Button type="submit" disabled={!ready || saving} className="login-submit h-[52px] w-full rounded-lg shadow-none">{saving ? 'Saving…' : step === 2 ? 'Let’s go' : 'Continue'}{!saving && <FaArrowRight />}</Button></div></form>
  </div></main>;
}

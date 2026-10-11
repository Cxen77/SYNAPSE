import React from 'react';
import { FaCheck, FaCode, FaTools, FaMicrophone, FaTrophy, FaMusic, FaRunning, FaUsers, FaPalette, FaRocket, FaGamepad, FaRobot, FaBriefcase, FaLaptopCode, FaUser } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { INTERESTS, ROLES, SKILLS } from './account-options';

const interestIcons = [FaCode, FaTools, FaMicrophone, FaTrophy, FaMusic, FaRunning, FaUsers, FaPalette, FaRocket, FaGamepad, FaRobot, FaBriefcase];

export default function AccountQuestions({ step, value, onChange }) {
  const update = (key, next) => onChange({ ...value, [key]: next });
  const toggle = (key, item) => update(key, value[key].includes(item) ? value[key].filter(v => v !== item) : [...value[key], item]);
  const choices = (key, items) => <div className="grid grid-cols-2 gap-2.5">{items.map((item, index) => {
    const selected = value[key].includes(item);
    const Icon = key === 'interests' ? interestIcons[index] || FaCode : FaLaptopCode;
    return <Button key={item} type="button" variant="outline" aria-pressed={selected} onClick={() => toggle(key, item)} className={`account-choice ${key === 'interests' ? 'account-interest' : 'h-12'} justify-between rounded-lg px-3 text-xs shadow-none ${selected ? 'account-choice-selected' : ''}`}><span className="flex min-w-0 items-center gap-2.5"><Icon className="account-choice-icon shrink-0" /><span className="whitespace-normal text-left">{item}</span></span><span className="account-choice-check shrink-0">{selected && <FaCheck />}</span></Button>;
  })}</div>;

  if (step === 0) return <div className="space-y-5">
    <div className="account-identity"><div className="account-initials">{value.name.trim() ? value.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() : <FaUser />}</div><div className="min-w-0"><p className="truncate font-semibold">{value.name || 'Your profile'}</p><p className="truncate text-sm text-muted-foreground">@{value.username || 'username'}</p></div></div>
    <div><label htmlFor="account-name" className="mb-2 block text-sm font-medium">Your name</label><input id="account-name" autoComplete="name" className="login-input" placeholder="What should we call you?" value={value.name} onChange={e => update('name', e.target.value)} required maxLength={60} /></div>
    <div><label htmlFor="account-username" className="mb-2 block text-sm font-medium">Username</label><input id="account-username" autoComplete="username" className="login-input" placeholder="Choose your username" value={value.username} onChange={e => update('username', e.target.value.replace(/\s/g, '').toLowerCase())} required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]{3,24}" /><p className="mt-2 text-xs text-muted-foreground">3–24 letters, numbers or underscores.</p></div>
  </div>;
  if (step === 1) return <div><p className="mb-4 text-xs font-medium text-muted-foreground" aria-live="polite">{value.interests.length ? `${value.interests.length} selected` : 'Pick your favorites'}</p>{choices('interests', INTERESTS)}</div>;
  return <div className="space-y-6">
    <div><label htmlFor="account-role" className="mb-2 block text-sm font-medium">Your role</label><select id="account-role" className="login-input" value={value.preferredRole} onChange={e => update('preferredRole', e.target.value)}><option value="">Select a role (optional)</option>{ROLES.map(role => <option key={role}>{role}</option>)}</select></div>
    <div><p className="mb-3 text-sm font-medium">Your skills</p>{choices('skills', SKILLS)}</div>
  </div>;
}
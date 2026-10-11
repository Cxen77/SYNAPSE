// Auth, session, feature flags, notifications, colleges, legal.
import { db, ensure, newId, ago, nowIso, findUser, me, pub } from '../db';
import { route, httpError, requireUser } from '../server';
import legal from '../legal.json';

const authPayload = (u) => ({
  _id: u._id, name: u.name, username: u.username, email: u.email, profilePic: u.profilePic,
  isEmailVerified: u.isEmailVerified, role: u.role, onboarded: u.onboarded, accessToken: `demo-token-${u._id}`,
});

function startSession(u) {
  db.session = { userId: u._id, createdAt: nowIso() };
  return authPayload(u);
}

// ---------- auth ----------
route('post', '/auth/refresh', () => {
  if (!db.session) throw httpError(401, 'No refresh token');
  return { accessToken: `demo-token-${db.session.userId}` };
});

route('post', '/auth/login', ({ body }) => {
  const email = String(body.email || '').trim().toLowerCase();
  if (!email || !body.password) throw httpError(400, 'Please enter email and password');
  // Demo: any password works. Known emails sign in as that user, others as the demo user.
  const u = db.users.find((x) => x.email.toLowerCase() === email || x.username === email.split('@')[0]) || findUser('u_me');
  return startSession(u);
});

// Google is simulated in this UI-only prototype, never an actual OAuth session.
route('post', '/auth/google', ({ body }) => {
  let u = db.users.find(user => user.demoGoogle === true);
  if (!u && body.intent !== 'signup') return startSession(findUser('u_me'));
  if (!u) {
    u = {
      ...JSON.parse(JSON.stringify(findUser('u_me'))),
      _id: newId('u'), name: '', username: '', email: 'google-preview@fuseon.local', demoGoogle: true,
      profilePic: '', bannerPic: '', bio: '', interests: [], skills: [], projects: [],
      followers: [], following: [], teams: [], onboarded: false, createdAt: nowIso(),
    };
    db.users.push(u);
  }
  return startSession(u);
});

route('post', '/auth/signup', ({ body }) => {
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(body.password || '').length < 8) throw httpError(400, 'Enter a valid email and a password with at least 8 characters');
  if (db.users.some((u) => u.email.toLowerCase() === email)) throw httpError(400, 'User already exists');
  const username = body.username || email.split('@')[0];
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) throw httpError(400, 'That username is already taken. Go back and choose another.');
  const base = findUser('u_me');
  const u = {
    ...JSON.parse(JSON.stringify(base)),
    _id: newId('u'), name: body.name || username, username, email,
    profilePic: '', bannerPic: '', bio: '', skills: body.skills || [], interests: body.interests || [], projects: [],
    autoTeamPreferences: { ...(base.autoTeamPreferences || {}), preferredRole: body.preferredRole || '' },
    followers: [], following: [], teams: [], isEmailVerified: Boolean(body.completeOnboarding), onboarded: Boolean(body.completeOnboarding), createdAt: nowIso(),
  };
  db.users.push(u);
  // Preview-only completion; no password is stored and no real account is created.
  if (body.completeOnboarding) return startSession(u);
  return { message: 'Registration successful. Please verify your email.', requiresVerification: true, email };
});

route('post', '/auth/verify-email', ({ body }) => {
  const u = db.users.find((x) => x.email === String(body.email || '').toLowerCase());
  if (!u) throw httpError(404, 'User not found');
  if (!body.otp || String(body.otp).length < 4) throw httpError(400, 'Invalid OTP');
  u.isEmailVerified = true;
  return { message: 'Email verified successfully', ...startSession(u), isEmailVerified: true };
});

route('post', '/auth/resend-otp', () => ({ message: 'If the email is valid, a new code has been sent.', resendsRemaining: 2 }));
route('post', '/auth/forgot-password', () => ({ message: 'If a user with that email exists, a reset link has been sent.' }));
route('post', '/auth/reset-password', () => ({ message: 'Password reset successful. You can now login.' }));
route('post', '/auth/logout', () => { db.session = null; return { message: 'Logged out successfully' }; });
route('post', '/auth/logout-all', () => { db.session = null; return { message: 'All sessions logged out successfully' }; });

const sessionInfo = () => ({
  _id: 'sess_current', ipAddress: '103.211.18.42',
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Fuseon App',
  createdAt: db.session?.createdAt || nowIso(), expiresAt: new Date(Date.now() + 7 * 864e5).toISOString(),
});
route('get', '/auth/session', () => { requireUser(); return { session: sessionInfo() }; });
route('get', '/auth/sessions', () => {
  requireUser();
  return {
    sessions: [
      sessionInfo(),
      { _id: 'sess_2', ipAddress: '49.207.55.10', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0 Safari/537.36', createdAt: ago(60 * 26), expiresAt: new Date(Date.now() + 5 * 864e5).toISOString() },
    ],
  };
});

// ---------- me ----------
route('get', '/users/me', () => requireUser());
route('put', '/users/onboarding', ({ body }) => {
  const u = requireUser();
  if (body.username) {
    const username = String(body.username).trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) throw httpError(400, 'Choose a valid username');
    if (db.users.some(other => other._id !== u._id && other.username.toLowerCase() === username)) throw httpError(400, 'That username is already taken. Go back and choose another.');
    u.username = username;
  }
  if (body.name) u.name = String(body.name).trim();
  u.interests = Array.isArray(body.interests) ? body.interests : [];
  if (Array.isArray(body.skills)) u.skills = Array.from(new Set([...(u.skills || []), ...body.skills]));
  if (body.preferredRole) u.autoTeamPreferences = { ...(u.autoTeamPreferences || {}), preferredRole: body.preferredRole };
  u.onboarded = true;
  return u;
});
route('put', '/users/pushtoken', () => ({ message: 'Push token updated' }));

// ---------- system ----------
route('get', '/system/features', () => ({
  features: {
    chat: { enabled: true, isKilled: false, rolesAllowed: [] },
    events: { enabled: true, isKilled: false, rolesAllowed: [] },
    forum: { enabled: true, isKilled: false, rolesAllowed: [] },
    autoTeam: { enabled: true, isKilled: false, rolesAllowed: [] },
  },
}));

// ---------- notifications ----------
ensure('notifications', () => [
  { _id: 'n1', recipient: 'u_me', sender: 'u_priya', type: 'like', post: 'p1', message: 'liked your post', read: false, createdAt: ago(8) },
  { _id: 'n2', recipient: 'u_me', sender: 'u_aarav', type: 'invite', team: 't2', message: 'invited you to join Neural Ninjas', read: false, createdAt: ago(42) },
  { _id: 'n3', recipient: 'u_me', sender: 'u_rohan', type: 'follow', message: 'started following you', read: false, createdAt: ago(130) },
  { _id: 'n4', recipient: 'u_me', sender: 'u_sneha', type: 'comment', post: 'p1', message: 'commented on your post', read: true, createdAt: ago(60 * 5) },
  { _id: 'n5', recipient: 'u_me', sender: 'u_kabir', type: 'join_request', team: 't1', message: 'requested to join Code Crusaders', read: true, createdAt: ago(60 * 20) },
  { _id: 'n6', recipient: 'u_me', sender: 'u_org', type: 'match', event: 'e1', message: 'You have been matched into a team for HackRVCE 6.0', read: true, createdAt: ago(60 * 48) },
]);

const populateNotif = (n) => {
  const team = n.team && db.teams?.find((t) => t._id === n.team);
  const post = n.post && db.posts?.find((p) => p._id === n.post);
  const event = n.event && db.events?.find((e) => e._id === n.event);
  return {
    ...n,
    sender: pub(n.sender),
    team: n.team ? { _id: n.team, name: team?.name || 'Team' } : undefined,
    post: n.post ? { _id: n.post, content: post?.content || '' } : undefined,
    event: n.event ? { _id: n.event, title: event?.title || 'Event' } : undefined,
  };
};

route('get', '/notifications', () => {
  const u = requireUser();
  return db.notifications.filter((n) => n.recipient === u._id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20).map(populateNotif);
});
route('put', '/notifications/:id/read', ({ params }) => {
  const n = db.notifications.find((x) => x._id === params.id);
  if (!n) throw httpError(404, 'Notification not found');
  n.read = true;
  return populateNotif(n);
});

/** Helper for other handlers to create notifications. */
export function notify(recipient, sender, type, message, extra = {}) {
  if (!recipient || recipient === sender) return;
  db.notifications.unshift({ _id: newId('n'), recipient, sender, type, message, read: false, createdAt: nowIso(), ...extra });
}

// ---------- colleges ----------
const COLLEGES = [
  ['RV College of Engineering', 'Bengaluru', 'Karnataka'], ['PES University', 'Bengaluru', 'Karnataka'],
  ['BMS College of Engineering', 'Bengaluru', 'Karnataka'], ['MS Ramaiah Institute of Technology', 'Bengaluru', 'Karnataka'],
  ['Dayananda Sagar College of Engineering', 'Bengaluru', 'Karnataka'], ['IIT Bombay', 'Mumbai', 'Maharashtra'],
  ['IIT Delhi', 'New Delhi', 'Delhi'], ['NIT Karnataka', 'Surathkal', 'Karnataka'], ['VIT Vellore', 'Vellore', 'Tamil Nadu'],
  ['BITS Pilani', 'Pilani', 'Rajasthan'], ['Manipal Institute of Technology', 'Manipal', 'Karnataka'], ['IIIT Bangalore', 'Bengaluru', 'Karnataka'],
].map(([name, city, state], i) => ({ _id: `c${i}`, name, city, state, country: 'India' }));

route('get', '/colleges/search', ({ query }) => {
  const q = String(query.q || '').toLowerCase();
  return COLLEGES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
});
route('post', '/colleges/request', () => ({ message: 'College request submitted. We will review it shortly.' }));

// ---------- legal ----------
route('get', '/legal/:type', ({ params }) => {
  const doc = legal[params.type];
  if (!doc) throw httpError(404, 'Legal document not found');
  return doc;
});

export { me };

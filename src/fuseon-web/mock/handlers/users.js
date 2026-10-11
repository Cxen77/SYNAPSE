// Demo API handlers: /users/* (except /users/me, /users/onboarding, /users/pushtoken — see core.js)
import { db, newId, ago, nowIso, findUser, me, pub } from '../db';
import { route, httpError, requireUser } from '../server';
import { notify } from './core';

const ALLOWED_FIELDS = ['name', 'username', 'course', 'usn', 'college', 'collegeId', 'year', 'section', 'className', 'location', 'bio', 'skills', 'socials', 'projects', 'settings', 'password', 'currentPassword'];

function formatUserResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic || undefined,
    bannerPic: user.bannerPic || undefined,
    course: user.course,
    usn: user.usn || '',
    college: user.college,
    collegeId: user.collegeId,
    year: user.year,
    section: user.section,
    className: user.className,
    location: user.location,
    bio: user.bio,
    skills: user.skills,
    socials: user.socials,
    followers: user.followers,
    following: user.following,
    settings: user.settings,
    teams: user.teams || [],
    projects: user.projects || [],
    role: user.role,
    isSuspended: user.isSuspended,
    collegeVerified: user.collegeVerified,
    collegeVerificationMethod: user.collegeVerificationMethod || null,
    collegeVerifiedAt: user.collegeVerifiedAt || null,
    verificationNote: user.verificationNote || '',
    githubId: user.githubId,
  };
}

function withPostsCount(user) {
  const postsCount = (db.posts || []).filter((p) => p.user === user._id && !p.isDeleted).length;
  return { ...formatUserResponse(user), postsCount };
}

// u_me arrives connected to GitHub so the Stats card / Import modal have demo data out of the box.
const seedMe = findUser('u_me');
if (seedMe) {
  seedMe.githubId ??= 'devyadav';
  seedMe.githubAccessToken ??= 'demo-gh-token';
}

// ---------- own profile ----------
route('get', '/users/profile', () => withPostsCount(requireUser()));

route('put', '/users/profile', ({ body }) => {
  const user = requireUser();
  if (body.name) user.name = body.name;
  if (body.username && body.username !== user.username) {
    const existing = db.users.find((x) => x.username === body.username && x._id !== user._id);
    if (existing) throw httpError(400, 'Username is already taken. Please choose another.');
    user.username = body.username;
  }
  if (body.course !== undefined) user.course = body.course;
  if (body.usn !== undefined) user.usn = String(body.usn).trim().toUpperCase();
  if (body.college) user.college = body.college;
  if (body.collegeId) user.collegeId = body.collegeId;
  if (body.year !== undefined) user.year = body.year;
  if (body.section) user.section = body.section;
  if (body.className !== undefined) user.className = body.className;
  if (body.location) user.location = body.location;
  if (body.bio !== undefined) user.bio = body.bio;
  if (body.skills) user.skills = body.skills;
  if (body.socials) user.socials = { ...user.socials, ...body.socials };
  if (body.projects) user.projects = body.projects;
  if (body.settings) {
    user.settings = {
      privacy: { ...user.settings.privacy, ...body.settings.privacy },
      notifications: { ...user.settings.notifications, ...body.settings.notifications },
    };
  }
  if (body.password) {
    if (!body.currentPassword) throw httpError(400, 'Current password is required to set a new password.');
    // Demo: accept any current password.
  }
  return formatUserResponse(user);
});

route('delete', '/users/profile', () => {
  const user = requireUser();
  user.isSuspended = true;
  user.isDeleted = true;
  user.deletedAt = nowIso();
  user.bio = '';
  user.name = '[Deleted User]';
  db.session = null;
  return { message: 'Account deactivated' };
});

// ---------- profile / banner pic ----------
route('put', '/users/profile-pic', ({ body }) => {
  const user = requireUser();
  if (!body.profilePic) throw httpError(400, 'No image file provided');
  user.profilePic = body.profilePic;
  return formatUserResponse(user);
});

route('put', '/users/banner-pic', ({ body }) => {
  const user = requireUser();
  if (!body.bannerPic) throw httpError(400, 'No image file provided');
  user.bannerPic = body.bannerPic;
  return formatUserResponse(user);
});

// ---------- search / recommended ----------
route('get', '/users/search', ({ query }) => {
  requireUser();
  const q = String(query.q || '').trim().toLowerCase();
  if (!q) throw httpError(400, 'Search query is required');
  return db.users
    .filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
    .slice(0, 10)
    .map((u) => ({ _id: u._id, name: u.name, username: u.username, profilePic: u.profilePic, skills: u.skills, collegeVerified: u.collegeVerified }));
});

route('get', '/users/recommended', () => {
  const u = requireUser();
  return db.users
    .filter((x) => x._id !== u._id)
    .slice(0, 5)
    .map((x) => ({ _id: x._id, name: x.name, username: x.username, profilePic: x.profilePic, skills: x.skills, collegeVerified: x.collegeVerified, followers: x.followers }));
});

route('get', '/users/online', () => {
  requireUser();
  return [];
});

// ---------- GitHub ----------
const DEMO_REPOS = [
  { id: 1, name: 'fuseon', description: 'Campus network for hackathons, teams and events.', language: 'JavaScript', html_url: 'https://github.com/devyadav/fuseon', homepage: 'https://fuseon.in' },
  { id: 2, name: 'smartattend', description: 'QR based attendance app with geo-fencing.', language: 'Kotlin', html_url: 'https://github.com/devyadav/smartattend', homepage: '' },
  { id: 3, name: 'dsa-practice', description: 'Daily DSA problem solutions in C++.', language: 'C++', html_url: 'https://github.com/devyadav/dsa-practice', homepage: '' },
  { id: 4, name: 'portfolio-v2', description: 'Personal portfolio built with Next.js.', language: 'TypeScript', html_url: 'https://github.com/devyadav/portfolio-v2', homepage: 'https://devyadav.dev' },
  { id: 5, name: 'ml-notebooks', description: 'Collection of ML experiments and notebooks.', language: 'Python', html_url: 'https://github.com/devyadav/ml-notebooks', homepage: '' },
];

route('get', '/users/github/repos', () => {
  const u = requireUser();
  if (!u.githubAccessToken) throw httpError(401, 'GitHub account not connected');
  return DEMO_REPOS;
});

route('delete', '/users/github', () => {
  const u = requireUser();
  u.githubId = undefined;
  u.githubAccessToken = undefined;
  return { message: 'GitHub account disconnected' };
});

route('get', '/users/:id/github/stats', ({ params }) => {
  const user = findUser(params.id);
  if (!user || !user.githubId) throw httpError(404, 'GitHub not connected');
  return {
    username: user.socials?.github || user.username,
    profileUrl: `https://github.com/${user.socials?.github || user.username}`,
    totalStars: 142,
    totalForks: 38,
    totalRepos: DEMO_REPOS.length,
    followers: 56,
    following: 40,
    topLanguages: [
      { name: 'JavaScript', percent: 42 },
      { name: 'TypeScript', percent: 26 },
      { name: 'Python', percent: 18 },
      { name: 'C++', percent: 14 },
    ],
  };
});

// ---------- stats ----------
route('get', '/users/:id/stats', ({ params }) => {
  const user = findUser(params.id);
  if (!user) throw httpError(404, 'User not found');
  return {
    followersCount: (user.followers || []).length,
    followingCount: (user.following || []).length,
    followers: (user.followers || []).map(pub),
    following: (user.following || []).map(pub),
  };
});

// ---------- verification ----------
route('post', '/users/verify-email-start', ({ body }) => {
  const user = requireUser();
  const email = String(body.collegeEmail || '').trim().toLowerCase();
  if (!email || !email.includes('@')) throw httpError(400, 'Please provide a valid college email address.');
  if (user.collegeVerified === 'true') throw httpError(400, 'You are already verified.');
  if (user.collegeVerified === 'pending') throw httpError(400, 'You have a pending ID card review. Wait for admin approval or contact support.');
  user._pendingVerifyEmail = email;
  user._demoOtp = '123456';
  return { message: 'OTP sent to your college email. It expires in 10 minutes. (Demo OTP: 123456)' };
});

route('post', '/users/verify-email-otp', ({ body }) => {
  const user = requireUser();
  const otp = String(body.otp || '');
  if (!otp) throw httpError(400, 'OTP is required');
  if (user.collegeVerified === 'true') throw httpError(400, 'Already verified.');
  if (!user._pendingVerifyEmail) throw httpError(400, 'No OTP found. Please request a new one via college email.');
  if (otp !== (user._demoOtp || '123456')) throw httpError(400, 'Invalid OTP. Please check and try again.');
  user.collegeVerified = 'true';
  user.collegeVerificationMethod = 'email';
  user.collegeVerifiedAt = nowIso();
  user.verificationNote = '';
  user._pendingVerifyEmail = undefined;
  user._demoOtp = undefined;
  return formatUserResponse(user);
});

route('post', '/users/verify-id', ({ body }) => {
  const user = requireUser();
  if (user.collegeVerified === 'true') throw httpError(400, 'You are already verified.');
  if (user.collegeVerified === 'pending') throw httpError(400, 'Your ID card is already under review. Please wait for admin approval.');
  if (!body.idCard) throw httpError(400, 'Please upload an image of your college ID card.');
  user.collegeVerified = 'pending';
  user.collegeVerificationMethod = 'id_card';
  user.collegeIdCardUrl = body.idCard;
  user.verificationNote = '';
  return formatUserResponse(user);
});

// ---------- follow ----------
route('put', '/users/:id/follow', ({ params }) => {
  const current = requireUser();
  const target = findUser(params.id);
  if (!target) throw httpError(404, 'User not found');
  current.following = current.following || [];
  target.followers = target.followers || [];
  if (current.following.includes(target._id)) {
    current.following = current.following.filter((id) => id !== target._id);
    target.followers = target.followers.filter((id) => id !== current._id);
    return { message: 'Unfollowed user' };
  }
  current.following.push(target._id);
  target.followers.push(current._id);
  notify(target._id, current._id, 'follow', 'started following you');
  return { message: 'Followed user' };
});

// ---------- public profile by username (keep last: least specific) ----------
route('get', '/users/:username', ({ params }) => {
  requireUser();
  const user = findUser(params.username);
  if (!user) throw httpError(404, 'User not found');
  return withPostsCount(user);
});

/**
 * Demo data store for the Fuseon prototype.
 * Shapes mirror the original backend's Mongo models so screens stay unchanged
 * when this layer is swapped for the real API.
 * Persisted to localStorage so the prototype behaves like a real app.
 */
const KEY = 'fuseon-demo-db-v3';

const isBrowser = typeof window !== 'undefined';

function load() {
  if (!isBrowser) return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export const db = load();

let saveTimer = null;
export function persist() {
  if (!isBrowser) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota */ }
  }, 50);
}

export function resetDemo() {
  if (!isBrowser) return;
  window.localStorage.removeItem(KEY);
  window.location.href = '/login';
}

/** Seed a collection once. Seed functions receive the db (users are always seeded first). */
export function ensure(name, seed) {
  if (!db[name]) {
    db[name] = seed(db);
    persist();
  }
  return db[name];
}

export const newId = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-3)}`;
export const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();
export const ahead = (days) => new Date(Date.now() + days * 86400000).toISOString();
export const nowIso = () => new Date().toISOString();

export const avatar = (n) => `https://i.pravatar.cc/200?img=${n}`;
export const photo = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

const baseSettings = () => ({
  privacy: { profileVisibility: 'public', allowMessages: true, allowTeamInvites: true, showOnlineStatus: true, showLastActive: true },
  notifications: { emailNotifications: true, teamInvites: true, newMessages: true, eventReminders: true, mentions: true, pushNotifications: true },
});

function mkUser(_id, name, username, img, extra = {}) {
  return {
    _id, name, username,
    email: `${username}@rvce.edu.in`,
    role: 'user',
    isEmailVerified: true,
    collegeVerified: 'true',
    profilePic: img ? avatar(img) : '',
    bannerPic: '',
    course: 'B.E. Computer Science',
    usn: '',
    college: 'RV College of Engineering',
    year: '3rd Year',
    section: 'A',
    location: 'Bengaluru, India',
    bio: '',
    skills: [],
    interests: [],
    socials: { github: '', linkedin: '', twitter: '', instagram: '', portfolio: '' },
    followers: [], following: [], teams: [], savedPosts: [],
    projects: [],
    settings: baseSettings(),
    onboarded: true,
    autoTeamPreferences: { enabled: true, preferredRole: 'Frontend', teamSize: 4, lookingFor: [] },
    createdAt: ago(60 * 24 * 200),
    lastActive: ago(5),
    ...extra,
  };
}

ensure('users', () => [
  mkUser('u_me', 'Dev Yadav', 'devyadav', 12, {
    bio: 'Full-stack developer • Hackathon enthusiast • Building Fuseon 🚀',
    skills: ['React', 'Node.js', 'UI/UX', 'MongoDB', 'Figma'],
    interests: [],
    onboarded: false,
    usn: '1RV22CS045',
    bannerPic: photo('photo-1557683316-973673baf926', 1400),
    socials: { github: 'devyadav', linkedin: 'devyadav', twitter: '', instagram: '', portfolio: 'https://devyadav.dev' },
    followers: ['u_aarav', 'u_priya', 'u_rohan', 'u_sneha'],
    following: ['u_aarav', 'u_priya', 'u_kabir'],
    projects: [
      { _id: 'pr1', title: 'Fuseon', desc: 'A campus network to find events, teammates and communities.', image: photo('photo-1551650975-87deedd944c3'), status: 'In Progress', role: 'Lead Developer', tags: ['React', 'Node.js', 'Socket.io'], github: 'https://github.com/devyadav/fuseon', liveDemo: 'https://fuseon.in' },
      { _id: 'pr2', title: 'SmartAttend', desc: 'QR based attendance with geo-fencing for college events.', image: photo('photo-1517694712202-14dd9538aa97'), status: 'Completed', role: 'Frontend', tags: ['React Native', 'Firebase'], github: 'https://github.com/devyadav/smartattend', liveDemo: '' },
    ],
  }),
  mkUser('u_aarav', 'Aarav Sharma', 'aarav', 13, { bio: 'ML engineer in the making. Kaggle expert.', skills: ['Python', 'TensorFlow', 'ML', 'Data Science'], followers: ['u_me'], following: ['u_me'] }),
  mkUser('u_priya', 'Priya Nair', 'priya', 47, { bio: 'Designer who codes ✨', skills: ['Figma', 'UI/UX', 'React', 'Illustration'], year: '2nd Year', followers: ['u_me'], following: ['u_me'] }),
  mkUser('u_rohan', 'Rohan Mehta', 'rohan', 33, { bio: 'Backend & cloud. AWS certified.', skills: ['Node.js', 'AWS', 'Docker', 'Go'], following: ['u_me'] }),
  mkUser('u_sneha', 'Sneha Reddy', 'sneha', 45, { bio: 'Competitive programmer | ICPC regionalist', skills: ['C++', 'DSA', 'Java'], college: 'PES University', following: ['u_me'] }),
  mkUser('u_kabir', 'Kabir Singh', 'kabir', 59, { bio: 'Blockchain & Web3 builder', skills: ['Solidity', 'Web3', 'React'], college: 'BMS College of Engineering', followers: ['u_me'] }),
  mkUser('u_ananya', 'Ananya Iyer', 'ananya', 32, { bio: 'Product + growth. Ex-intern @ Razorpay', skills: ['Product', 'Marketing', 'Notion'], year: '4th Year' }),
  mkUser('u_vikram', 'Vikram Rao', 'vikram', 53, { bio: 'IoT & embedded tinkerer', skills: ['Arduino', 'C', 'IoT', 'Python'] }),
  mkUser('u_meera', 'Meera Joshi', 'meera', 44, { bio: 'Android dev, Kotlin lover', skills: ['Kotlin', 'Android', 'Flutter'], college: 'PES University' }),
  mkUser('u_arjun', 'Arjun Das', 'arjun', 68, { bio: 'Cybersecurity • CTF player', skills: ['Security', 'Linux', 'Python'] }),
  mkUser('u_org', 'IEEE RVCE', 'ieeervce', 0, { role: 'organizer', profilePic: photo('photo-1560179707-f14e90ef3623', 200), bio: 'Official IEEE Student Branch of RVCE' }),
]);

ensure('session', () => null);

export const users = () => db.users;
export const findUser = (id) => db.users.find((u) => u._id === id || u.username === id);
export const currentUserId = () => db.session?.userId || null;
export const me = () => (db.session ? findUser(db.session.userId) : null);

/** Lightweight populated user, like `.populate('user', 'name username profilePic')` */
export const pub = (idOrUser) => {
  const u = typeof idOrUser === 'string' ? findUser(idOrUser) : idOrUser;
  if (!u) return null;
  return { _id: u._id, name: u.name, username: u.username, profilePic: u.profilePic, college: u.college, skills: u.skills, collegeVerified: u.collegeVerified, role: u.role, bio: u.bio, course: u.course, year: u.year };
};

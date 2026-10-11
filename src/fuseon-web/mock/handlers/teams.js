// Demo API handlers for Teams. See ../server.js for the route() helper.
import { db, ensure, newId, ago, ahead, nowIso, findUser } from '../db';
import { route, httpError, requireUser } from '../server';
import { notify } from './core';

// ---------- helpers ----------

/** Subset used for members/admins/createdBy/memberRoles.userId populate */
function userLite(idOrUser) {
  const u = typeof idOrUser === 'string' ? findUser(idOrUser) : idOrUser;
  if (!u) return null;
  return { _id: u._id, name: u.name, username: u.username, profilePic: u.profilePic, collegeVerified: u.collegeVerified };
}

/** Subset used for joinRequests.userId populate (includes email) */
function userWithEmail(idOrUser) {
  const u = typeof idOrUser === 'string' ? findUser(idOrUser) : idOrUser;
  if (!u) return null;
  return { _id: u._id, name: u.name, username: u.username, profilePic: u.profilePic, email: u.email, collegeVerified: u.collegeVerified };
}

function findEventFallback(eventId) {
  if (!eventId) return null;
  const ev = db.events?.find((e) => e._id === eventId);
  if (ev) return { _id: ev._id, title: ev.title, bannerImage: ev.bannerImage, category: ev.category, startDate: ev.startDate };
  if (eventId === 'e1') {
    return { _id: 'e1', title: 'HackRVCE 6.0', bannerImage: '', category: 'Hackathon', startDate: ahead(20) };
  }
  return { _id: eventId };
}

/** Full populate used by getTeamById (includes invites/joinRequests/memberRoles) */
function populateTeamFull(team) {
  return {
    ...team,
    members: team.members.map((id) => userLite(id)).filter(Boolean),
    admins: team.admins.map((id) => userLite(id)).filter(Boolean),
    invites: team.invites.map((inv) => ({ ...inv, userId: userLite(inv.userId) })),
    createdBy: userLite(team.createdBy),
    joinRequests: team.joinRequests.map((r) => ({ ...r, userId: userWithEmail(r.userId) })),
    memberRoles: team.memberRoles.map((mr) => ({ ...mr, userId: userLite(mr.userId) })),
    event: team.eventId ? findEventFallback(team.eventId) : null,
  };
}

/** Populate used by getMyTeams / getUserTeams (members/admins/createdBy only) */
function populateTeamBasic(team) {
  return {
    ...team,
    members: team.members.map((id) => userLite(id)).filter(Boolean),
    admins: team.admins.map((id) => userLite(id)).filter(Boolean),
    createdBy: userLite(team.createdBy),
  };
}

function isAdmin(team, userId) {
  return team.admins.includes(userId);
}
function isOwner(team, userId) {
  return String(team.createdBy) === String(userId);
}
function isCoLead(team, userId) {
  return team.memberRoles.some((mr) => mr.userId === userId && mr.role === 'co-lead');
}

// ---------- seed ----------

ensure('teams', () => {
  const teams = [];

  // t1 — Code Crusaders — led by u_me, event-linked, with open role + pending join requests
  teams.push({
    _id: 't1',
    name: 'Code Crusaders',
    description: 'Building a full-stack hackathon project for HackRVCE 6.0 — React + Node + Socket.io.',
    category: 'Development',
    visibility: 'public',
    eventId: 'e1',
    isAutoCreated: false,
    members: ['u_me', 'u_priya', 'u_rohan'],
    admins: ['u_me'],
    invites: [],
    createdBy: 'u_me',
    isLookingForMembers: true,
    teamStatus: 'active',
    currentFocus: 'Finishing the real-time chat feature before the demo',
    projectGoals: 'We are building Fuseon-style campus networking tool for HackRVCE 6.0. Goal: working MVP with auth, teams and real-time chat by the deadline. Stack: React, Node.js, Socket.io, MongoDB.',
    openRoles: [
      { _id: 'r_t1_1', title: 'Backend Developer', description: 'Help build REST APIs and sockets.', requiredSkills: ['Node.js', 'MongoDB'], vacancies: 2, filledCount: 0, isOpen: true },
    ],
    memberRoles: [
      { userId: 'u_me', role: 'owner' },
      { userId: 'u_priya', role: 'co-lead' },
      { userId: 'u_rohan', role: 'member' },
    ],
    joinRequests: [
      { _id: 'jr_t1_1', userId: 'u_kabir', roleId: 'r_t1_1', status: 'pending', message: 'I have built a few Node.js + MongoDB APIs and shipped a Web3 hackathon project last semester. Would love to help with the backend and sockets for Code Crusaders!', createdAt: ago(60 * 5) },
      { _id: 'jr_t1_2', userId: 'u_vikram', roleId: null, status: 'pending', message: 'I mostly do embedded/IoT work but have decent Python + C skills and want to try a web hackathon. Happy to help wherever needed.', createdAt: ago(60 * 20) },
      { _id: 'jr_t1_3', userId: 'u_arjun', roleId: 'r_t1_1', status: 'rejected', message: 'Security-focused backend dev, can help harden the APIs.', createdAt: ago(60 * 24 * 3) },
    ],
    createdAt: ago(60 * 24 * 10),
    updatedAt: ago(30),
  });

  // t2 — Neural Ninjas — led by u_aarav, u_me has a pending invite
  teams.push({
    _id: 't2',
    name: 'Neural Ninjas',
    description: 'ML/AI focused team competing in campus hackathons and Kaggle competitions.',
    category: 'Research',
    visibility: 'public',
    eventId: 'e1',
    isAutoCreated: false,
    members: ['u_aarav', 'u_sneha'],
    admins: ['u_aarav'],
    invites: [
      { userId: 'u_me', status: 'pending', roleId: null },
      { userId: 'u_meera', status: 'accepted', roleId: null },
    ],
    createdBy: 'u_aarav',
    isLookingForMembers: true,
    teamStatus: 'active',
    currentFocus: 'Training a model for the HackRVCE 6.0 problem statement',
    projectGoals: 'Competing in HackRVCE 6.0 with an ML-powered campus recommendation engine. Looking for a strong frontend dev to help ship the demo UI.',
    openRoles: [
      { _id: 'r_t2_1', title: 'Frontend Developer', description: 'Build the demo dashboard for our ML model.', requiredSkills: ['React', 'UI/UX'], vacancies: 1, filledCount: 0, isOpen: true },
    ],
    memberRoles: [
      { userId: 'u_aarav', role: 'owner' },
      { userId: 'u_sneha', role: 'member' },
    ],
    joinRequests: [],
    createdAt: ago(60 * 24 * 15),
    updatedAt: ago(120),
  });

  // t3 — Pixel Perfect — open design team led by u_meera
  teams.push({
    _id: 't3',
    name: 'Pixel Perfect',
    description: 'A design collective working on UI/UX case studies and campus app redesigns.',
    category: 'Design',
    visibility: 'public',
    eventId: null,
    isAutoCreated: false,
    members: ['u_meera'],
    admins: ['u_meera'],
    invites: [],
    createdBy: 'u_meera',
    isLookingForMembers: true,
    teamStatus: 'active',
    currentFocus: 'Redesigning the campus events app onboarding flow',
    projectGoals: 'Portfolio-driven design team. We take on real campus app redesign briefs and publish case studies.',
    openRoles: [
      { _id: 'r_t3_1', title: 'UI/UX Designer', description: 'Own end-to-end flows in Figma.', requiredSkills: ['Figma', 'UI/UX'], vacancies: 2, filledCount: 0, isOpen: true },
      { _id: 'r_t3_2', title: 'Graphic Designer', description: 'Create social media assets and branding.', requiredSkills: ['Illustrator', 'Photoshop'], vacancies: 1, filledCount: 1, isOpen: false },
    ],
    memberRoles: [{ userId: 'u_meera', role: 'owner' }],
    joinRequests: [
      { _id: 'jr_t3_1', userId: 'u_ananya', roleId: 'r_t3_1', status: 'pending', message: 'I have done product + growth design work during my internship and want to build a stronger design portfolio.', createdAt: ago(60 * 8) },
    ],
    createdAt: ago(60 * 24 * 25),
    updatedAt: ago(60 * 6),
  });

  // t4 — DevOps Dynamos — private team led by u_rohan (not visible in open teams)
  teams.push({
    _id: 't4',
    name: 'DevOps Dynamos',
    description: 'Infra and tooling guild — CI/CD pipelines, Docker, and cloud deployments for campus projects.',
    category: 'Development',
    visibility: 'private',
    eventId: null,
    isAutoCreated: false,
    members: ['u_rohan', 'u_me'],
    admins: ['u_rohan'],
    invites: [],
    createdBy: 'u_rohan',
    isLookingForMembers: false,
    teamStatus: 'active',
    currentFocus: 'Setting up a shared Kubernetes cluster for club projects',
    projectGoals: '',
    openRoles: [],
    memberRoles: [
      { userId: 'u_rohan', role: 'owner' },
      { userId: 'u_me', role: 'co-lead' },
    ],
    joinRequests: [],
    createdAt: ago(60 * 24 * 40),
    updatedAt: ago(60 * 24 * 2),
  });

  // t5 — Growth Hackers — open marketing/growth team led by u_ananya
  teams.push({
    _id: 't5',
    name: 'Growth Hackers',
    description: 'Marketing + growth squad helping student startups and clubs grow their audience.',
    category: 'Marketing',
    visibility: 'public',
    eventId: null,
    isAutoCreated: false,
    members: ['u_ananya'],
    admins: ['u_ananya'],
    invites: [],
    createdBy: 'u_ananya',
    isLookingForMembers: true,
    teamStatus: 'active',
    currentFocus: 'Running a campus-wide referral campaign',
    projectGoals: 'We run growth experiments for campus clubs and startups — content, SEO, and campaigns.',
    openRoles: [
      { _id: 'r_t5_1', title: 'Content Writer', description: 'Write blog posts and social copy.', requiredSkills: ['Writing', 'SEO'], vacancies: 2, filledCount: 0, isOpen: true },
      { _id: 'r_t5_2', title: 'Social Media Manager', description: 'Plan and post content calendars.', requiredSkills: ['Content Strategy', 'Copywriting'], vacancies: 1, filledCount: 0, isOpen: true },
    ],
    memberRoles: [{ userId: 'u_ananya', role: 'owner' }],
    joinRequests: [],
    createdAt: ago(60 * 24 * 5),
    updatedAt: ago(60 * 2),
  });

  // t6 — CTF Squad — paused open team led by u_arjun
  teams.push({
    _id: 't6',
    name: 'CTF Squad',
    description: 'Cybersecurity enthusiasts practicing CTFs together and building a bug-bounty study group.',
    category: 'Research',
    visibility: 'public',
    eventId: null,
    isAutoCreated: false,
    members: ['u_arjun', 'u_kabir'],
    admins: ['u_arjun'],
    invites: [],
    createdBy: 'u_arjun',
    isLookingForMembers: false,
    teamStatus: 'paused',
    currentFocus: '',
    projectGoals: 'Weekly CTF practice sessions and writeups. Currently paused for exams — reopening next month.',
    openRoles: [
      { _id: 'r_t6_1', title: 'Security Researcher', description: 'Pwn/web/crypto challenges.', requiredSkills: ['Security', 'Linux'], vacancies: 3, filledCount: 2, isOpen: false },
    ],
    memberRoles: [
      { userId: 'u_arjun', role: 'owner' },
      { userId: 'u_kabir', role: 'member' },
    ],
    joinRequests: [],
    createdAt: ago(60 * 24 * 60),
    updatedAt: ago(60 * 24 * 7),
  });

  return teams;
});

// Keep the other users' `teams` arrays loosely in sync for anything that reads from User docs.
function syncUserTeams(userId) {
  const u = findUser(userId);
  if (!u) return;
  u.teams = db.teams.filter((t) => t.members.includes(userId)).map((t) => t._id);
}

// ---------- routes ----------

// GET /teams — my teams
route('get', '/teams', () => {
  const user = requireUser();
  const teams = db.teams.filter((t) => t.members.includes(user._id));
  return teams.map(populateTeamBasic);
});

// GET /teams/open?page=&limit=&category=
route('get', '/teams/open', ({ query }) => {
  requireUser();
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const category = query.category;

  let filtered = db.teams.filter(
    (t) => t.isLookingForMembers && t.visibility === 'public' && t.teamStatus === 'active'
  );
  if (category) filtered = filtered.filter((t) => t.category === category);
  filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalTeams = filtered.length;
  const start = (page - 1) * limit;
  const pageTeams = filtered.slice(start, start + limit).map((t) => ({
    _id: t._id,
    name: t.name,
    category: t.category,
    openRoles: t.openRoles,
    members: t.members.map((id) => ({ _id: id })),
    createdBy: userLite(t.createdBy),
    description: t.description,
    teamStatus: t.teamStatus,
  }));

  return {
    teams: pageTeams,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalTeams / limit)),
    totalTeams,
  };
});

// GET /teams/invites
route('get', '/teams/invites', () => {
  const user = requireUser();
  const teams = db.teams.filter((t) => t.invites.some((inv) => inv.userId === user._id && inv.status === 'pending'));
  return teams.map((t) => ({
    _id: t._id,
    name: t.name,
    description: t.description,
    category: t.category,
    members: t.members.map((id) => userLite(id)).filter(Boolean),
    createdBy: userLite(t.createdBy),
    invites: t.invites.map((inv) => ({ ...inv, userId: userLite(inv.userId) })),
  }));
});

// GET /teams/search?q=
route('get', '/teams/search', ({ query }) => {
  requireUser();
  const q = (query.q || '').trim();
  if (!q) throw httpError(400, 'Search query is required');
  const re = new RegExp(q, 'i');
  const teams = db.teams.filter((t) => t.visibility === 'public' && re.test(t.name)).slice(0, 10);
  return teams.map((t) => ({ ...t, members: t.members.map((id) => userLite(id)).filter(Boolean) }));
});

// GET /teams/user/:userId
route('get', '/teams/user/:userId', ({ params }) => {
  const user = requireUser();
  const { userId } = params;
  const isOwn = String(user._id) === String(userId);
  let teams = db.teams.filter((t) => t.members.includes(userId));
  if (!isOwn) teams = teams.filter((t) => t.visibility === 'public');
  return teams.map((t) => ({
    _id: t._id,
    name: t.name,
    description: t.description,
    category: t.category,
    visibility: t.visibility,
    isLookingForMembers: t.isLookingForMembers,
    teamStatus: t.teamStatus,
    currentFocus: t.currentFocus,
    openRoles: t.openRoles,
    members: t.members.map((id) => userLite(id)).filter(Boolean),
    createdBy: userLite(t.createdBy),
    memberRoles: t.memberRoles.map((mr) => ({ ...mr, userId: userLite(mr.userId) })),
  }));
});

// GET /teams/:id
route('get', '/teams/:id', ({ params }) => {
  requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  return populateTeamFull(team);
});

// POST /teams — create
route('post', '/teams', ({ body }) => {
  const user = requireUser();
  const { name, description, category, visibility } = body;
  if (!name || !description || !category) throw httpError(400, 'Name, description and category are required');
  const team = {
    _id: newId('t'),
    name,
    description,
    category,
    visibility: visibility || 'public',
    eventId: null,
    isAutoCreated: false,
    members: [user._id],
    admins: [user._id],
    invites: [],
    createdBy: user._id,
    isLookingForMembers: false,
    teamStatus: 'active',
    currentFocus: '',
    projectGoals: '',
    openRoles: [],
    memberRoles: [{ userId: user._id, role: 'owner' }],
    joinRequests: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.teams.push(team);
  syncUserTeams(user._id);
  return populateTeamFull(team);
});

// PUT /teams/:id/invite
route('put', '/teams/:id/invite', ({ params, body }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isAdmin(team, user._id)) throw httpError(401, 'Not authorized as admin');
  const { userId } = body;
  if (!userId || !findUser(userId)) throw httpError(400, 'Invalid user');
  if (team.members.includes(userId)) throw httpError(400, 'User already in team');
  if (team.invites.find((inv) => inv.userId === userId)) throw httpError(400, 'User already invited');
  team.invites.push({ userId, status: 'pending', roleId: null });
  team.updatedAt = nowIso();
  notify(userId, user._id, 'invite', `You have been invited to join ${team.name}`, { team: team._id });
  return { message: 'User invited' };
});

// PUT /teams/:id/accept
route('put', '/teams/:id/accept', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  const inv = team.invites.find((i) => i.userId === user._id && i.status === 'pending');
  if (!inv) throw httpError(400, 'No pending invite found');
  inv.status = 'accepted';
  if (!team.members.includes(user._id)) {
    team.members.push(user._id);
    team.memberRoles.push({ userId: user._id, role: 'member' });
  }
  team.updatedAt = nowIso();
  syncUserTeams(user._id);
  return { message: 'Invite accepted' };
});

// PUT /teams/:id/decline
route('put', '/teams/:id/decline', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  const inv = team.invites.find((i) => i.userId === user._id && i.status === 'pending');
  if (!inv) throw httpError(400, 'No pending invite found');
  inv.status = 'rejected';
  team.updatedAt = nowIso();
  return { message: 'Invite declined' };
});

// PUT /teams/:id/join
route('put', '/teams/:id/join', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (team.visibility === 'private') throw httpError(400, 'Cannot join private team without invite');
  if (team.members.includes(user._id)) throw httpError(400, 'User already in team');
  team.members.push(user._id);
  team.memberRoles.push({ userId: user._id, role: 'member' });
  team.updatedAt = nowIso();
  syncUserTeams(user._id);
  return { message: 'Joined team' };
});

// PUT /teams/:id/leave
route('put', '/teams/:id/leave', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (String(team.createdBy) === String(user._id)) {
    throw httpError(400, 'Team owners cannot leave. You must transfer ownership or delete the team.');
  }
  if (!team.members.includes(user._id)) throw httpError(400, 'You are not a member of this team');
  team.members = team.members.filter((m) => m !== user._id);
  team.admins = team.admins.filter((a) => a !== user._id);
  team.memberRoles = team.memberRoles.filter((mr) => mr.userId !== user._id);
  team.updatedAt = nowIso();
  syncUserTeams(user._id);
  return { message: 'Left team successfully' };
});

// PUT /teams/:id/remove/:userId
route('put', '/teams/:id/remove/:userId', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isAdmin(team, user._id)) throw httpError(401, 'Not authorized as admin');
  const { userId } = params;
  team.members = team.members.filter((m) => m !== userId);
  team.admins = team.admins.filter((a) => a !== userId);
  team.joinRequests = team.joinRequests.filter((r) => r.userId !== userId);
  team.memberRoles = team.memberRoles.filter((mr) => mr.userId !== userId);
  team.updatedAt = nowIso();
  syncUserTeams(userId);
  return { message: 'Member removed' };
});

// PUT /teams/:id/update
route('put', '/teams/:id/update', ({ params, body }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isAdmin(team, user._id)) throw httpError(401, 'Not authorized as admin');
  const { name, description, projectGoals, category, visibility, currentFocus, teamStatus } = body;
  if (name) team.name = name;
  if (description) team.description = description;
  if (projectGoals !== undefined) team.projectGoals = projectGoals;
  if (category) team.category = category;
  if (visibility) team.visibility = visibility;
  if (currentFocus !== undefined) team.currentFocus = currentFocus;
  if (teamStatus !== undefined) team.teamStatus = teamStatus;
  team.updatedAt = nowIso();
  return populateTeamFull(team);
});

// POST /teams/:id/request-join
route('post', '/teams/:id/request-join', ({ params, body }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (team.visibility !== 'public') throw httpError(403, 'Cannot request to join a private team');
  if (team.teamStatus !== 'active') throw httpError(400, 'This team is not currently accepting members');

  let message = String(body.message || '').trim().replace(/<[^>]*>/g, '');
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  if (wordCount > 500) throw httpError(400, `Message too long (${wordCount} words). Maximum is 500 words.`);
  if (message.length > 3000) throw httpError(400, 'Message exceeds maximum length of 3000 characters.');
  if (!message) throw httpError(400, 'Please tell the team about yourself and why you want to join.');

  const { roleId } = body;
  if (team.members.includes(user._id)) throw httpError(400, 'You are already a member of this team');

  const existingIdx = team.joinRequests.findIndex((r) => r.userId === user._id);
  if (existingIdx !== -1) {
    const existing = team.joinRequests[existingIdx];
    if (existing.status === 'pending') throw httpError(400, 'You already have a pending join request for this team');
    team.joinRequests[existingIdx] = { ...existing, message, roleId: roleId || null, status: 'pending', createdAt: nowIso() };
  } else {
    const openRoles = team.openRoles.filter((r) => r.isOpen);
    if (openRoles.length > 0) {
      if (!roleId) throw httpError(400, 'Please select a role to apply for');
      if (!openRoles.some((r) => r._id === roleId)) throw httpError(400, 'Invalid role selection');
    }
    team.joinRequests.push({ _id: newId('jr'), userId: user._id, roleId: roleId || null, message, status: 'pending', createdAt: nowIso() });
  }
  team.updatedAt = nowIso();
  notify(team.createdBy, user._id, 'join_request', `${user.name} requested to join ${team.name}`, { team: team._id });
  return { message: 'Join request sent' };
});

// PUT /teams/:id/join-requests/:reqId
route('put', '/teams/:id/join-requests/:reqId', ({ params, body }) => {
  const user = requireUser();
  const { action } = body;
  if (!['accept', 'reject'].includes(action)) throw httpError(400, 'Invalid action');
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isOwner(team, user._id) && !isCoLead(team, user._id)) throw httpError(403, 'Not authorized to manage join requests');

  const joinReq = team.joinRequests.find((r) => r._id === params.reqId);
  if (!joinReq) throw httpError(404, 'Join request not found');
  if (joinReq.status !== 'pending') throw httpError(400, 'Request is no longer pending');

  if (action === 'accept') {
    joinReq.status = 'accepted';
    if (!team.members.includes(joinReq.userId)) {
      team.members.push(joinReq.userId);
      team.memberRoles.push({ userId: joinReq.userId, role: 'member' });
    }
    if (joinReq.roleId) {
      const role = team.openRoles.find((r) => r._id === joinReq.roleId);
      if (role && role.isOpen) {
        role.filledCount = (role.filledCount || 0) + 1;
        if (role.filledCount >= (role.vacancies || 1)) {
          role.isOpen = false;
          team.isLookingForMembers = team.openRoles.some((r) => r.isOpen);
        }
      }
    }
    syncUserTeams(joinReq.userId);
    notify(joinReq.userId, user._id, 'join_accepted', `Your request to join ${team.name} was accepted!`, { team: team._id });
  } else {
    joinReq.status = 'rejected';
    notify(joinReq.userId, user._id, 'join_rejected', `Your request to join ${team.name} was not accepted`, { team: team._id });
  }
  team.updatedAt = nowIso();
  return { message: `Request ${action}ed` };
});

// POST /teams/:id/roles
route('post', '/teams/:id/roles', ({ params, body }) => {
  const user = requireUser();
  const { title, description, requiredSkills, vacancies } = body;
  if (!title) throw httpError(400, 'Role title is required');
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isOwner(team, user._id) && !isCoLead(team, user._id)) throw httpError(403, 'Not authorized');
  const parsedVacancies = Math.max(1, parseInt(vacancies, 10) || 1);
  team.openRoles.push({
    _id: newId('r'),
    title,
    description: description || '',
    requiredSkills: requiredSkills || [],
    vacancies: parsedVacancies,
    filledCount: 0,
    isOpen: true,
  });
  team.isLookingForMembers = team.openRoles.some((r) => r.isOpen);
  team.updatedAt = nowIso();
  return team.openRoles;
});

// PUT /teams/:id/roles/:roleId
route('put', '/teams/:id/roles/:roleId', ({ params, body }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isOwner(team, user._id) && !isCoLead(team, user._id)) throw httpError(403, 'Not authorized');
  const role = team.openRoles.find((r) => r._id === params.roleId);
  if (!role) throw httpError(404, 'Role not found');
  const { title, description, requiredSkills, isOpen, vacancies } = body;
  if (title !== undefined) role.title = title;
  if (description !== undefined) role.description = description;
  if (requiredSkills !== undefined) role.requiredSkills = requiredSkills;
  if (isOpen !== undefined) role.isOpen = isOpen;
  if (vacancies !== undefined) {
    role.vacancies = Math.max(1, parseInt(vacancies, 10) || 1);
    if (role.filledCount >= role.vacancies) role.isOpen = false;
  }
  team.isLookingForMembers = team.openRoles.some((r) => r.isOpen);
  team.updatedAt = nowIso();
  return team.openRoles;
});

// DELETE /teams/:id/roles/:roleId
route('delete', '/teams/:id/roles/:roleId', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isOwner(team, user._id) && !isCoLead(team, user._id)) throw httpError(403, 'Not authorized');
  team.openRoles = team.openRoles.filter((r) => r._id !== params.roleId);
  team.isLookingForMembers = team.openRoles.some((r) => r.isOpen);
  team.updatedAt = nowIso();
  return { message: 'Role deleted', openRoles: team.openRoles };
});

// PUT /teams/:id/members/:userId/promote
route('put', '/teams/:id/members/:userId/promote', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isOwner(team, user._id)) throw httpError(403, 'Only the team owner can promote members');
  const targetUserId = params.userId;
  if (!team.members.includes(targetUserId)) throw httpError(400, 'User is not a member of this team');
  const existing = team.memberRoles.find((mr) => mr.userId === targetUserId);
  if (existing) {
    if (existing.role === 'co-lead') throw httpError(400, 'User is already a co-lead');
    if (existing.role === 'owner') throw httpError(400, 'Use transferOwnership to change the owner');
    existing.role = 'co-lead';
  } else {
    team.memberRoles.push({ userId: targetUserId, role: 'co-lead' });
  }
  if (!team.admins.includes(targetUserId)) team.admins.push(targetUserId);
  team.updatedAt = nowIso();
  return { message: 'Member promoted to co-lead' };
});

// PUT /teams/:id/transfer
route('put', '/teams/:id/transfer', ({ params, body }) => {
  const user = requireUser();
  const { newOwnerId } = body;
  if (!newOwnerId) throw httpError(400, 'newOwnerId is required');
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (!isOwner(team, user._id)) throw httpError(403, 'Only the current owner can transfer ownership');
  if (!team.members.includes(newOwnerId)) throw httpError(400, 'New owner must already be a member of the team');
  if (newOwnerId === user._id) throw httpError(400, 'You are already the owner');

  const oldOwnerRole = team.memberRoles.find((mr) => mr.userId === user._id);
  if (oldOwnerRole) oldOwnerRole.role = 'co-lead';
  else team.memberRoles.push({ userId: user._id, role: 'co-lead' });

  const newOwnerRole = team.memberRoles.find((mr) => mr.userId === newOwnerId);
  if (newOwnerRole) newOwnerRole.role = 'owner';
  else team.memberRoles.push({ userId: newOwnerId, role: 'owner' });

  team.createdBy = newOwnerId;
  if (!team.admins.includes(newOwnerId)) team.admins.push(newOwnerId);
  team.updatedAt = nowIso();
  notify(newOwnerId, user._id, 'ownership_transfer', `You are now the owner of ${team.name}`, { team: team._id });
  return { message: 'Ownership transferred successfully' };
});

// DELETE /teams/:id
route('delete', '/teams/:id', ({ params }) => {
  const user = requireUser();
  const team = db.teams.find((t) => t._id === params.id);
  if (!team) throw httpError(404, 'Team not found');
  if (String(team.createdBy) !== String(user._id)) throw httpError(403, 'Only the team owner can delete this team');
  const memberIds = [...team.members];
  db.teams = db.teams.filter((t) => t._id !== team._id);
  db.notifications = (db.notifications || []).filter((n) => n.team !== team._id);
  memberIds.forEach(syncUserTeams);
  return { message: 'Team permanently deleted' };
});

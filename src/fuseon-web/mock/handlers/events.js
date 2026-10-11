// Demo API handlers: /events* and /autoteam*
// Shapes mirror synapse-backend/controllers/eventController.js + autoTeamController.js
import { db, ensure, newId, ago, ahead, nowIso, findUser, me, pub, photo } from '../db';
import { route, httpError, requireUser } from '../server';
import { serverEmit } from '../../shims/socket';

// ─── Seed Events ────────────────────────────────────────────────────────────
ensure('events', () => [
  {
    _id: 'e1', title: 'HackRVCE 6.0', description: 'A 24-hour multi-college hackathon where teams build full-stack products solving real campus problems. Mentorship from industry engineers, free food, and swag for every participant.',
    date: ahead(12), location: 'RVCE Main Auditorium, Bengaluru', category: 'Hackathon',
    prize: '₹1,00,000', imageUrl: photo('photo-1504384308090-c894fdcc538d', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: true,
    requireUSN: true, maxTeamSize: 4, attendees: ['u_aarav', 'u_priya', 'u_rohan'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 10),
  },
  {
    _id: 'e2', title: 'Advanced React Patterns Workshop', description: 'Deep dive into compound components, render props, custom hooks and performance optimisation with hands-on exercises.',
    date: ahead(5), location: 'Online (Zoom)', category: 'Workshop',
    prize: '', imageUrl: photo('photo-1540575467063-178a50c2df87', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: false,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_me', 'u_sneha'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 8),
  },
  {
    _id: 'e3', title: 'AI in Industry: Seminar Series', description: 'Industry leaders from top AI companies share insights on deploying machine learning at scale, ethics and career paths.',
    date: ago(60 * 24 * 6), location: 'RVCE Seminar Hall 2', category: 'Seminar',
    prize: '', imageUrl: photo('photo-1515187029135-18ee286d815b', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: false,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_me', 'u_kabir', 'u_vikram'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 20),
  },
  {
    _id: 'e4', title: 'Valorant Campus Clash', description: '5v5 Valorant tournament between college teams. Top 3 teams win cash prizes and gaming gear.',
    date: ahead(9), location: 'RVCE Esports Arena', category: 'Tournament',
    prize: '₹25,000 + Gear', imageUrl: photo('photo-1531482615713-2afd69097998', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: true,
    requireUSN: false, maxTeamSize: 5, attendees: ['u_vikram', 'u_arjun'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 5),
  },
  {
    _id: 'e5', title: 'Open Source Meetup', description: 'Casual evening meetup for students contributing to open source — share your projects, find collaborators, grab pizza.',
    date: ahead(2), location: 'Innovation Center, RVCE', category: 'Meetup',
    prize: '', imageUrl: photo('photo-1522202176988-66273c2fd55f', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: false,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_me', 'u_aarav', 'u_priya', 'u_rohan'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 3),
  },
  {
    _id: 'e6', title: '30-Day Build Sprint', description: 'Pick a side project, commit to building it in public for 30 days alongside a cohort of fellow builders with weekly check-ins.',
    date: ahead(20), location: 'Online (Discord)', category: 'Project',
    prize: 'Feature on Fuseon Blog', imageUrl: photo('photo-1517245386807-bb43f82c33c4', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: false,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_meera'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 2),
  },
  {
    _id: 'e7', title: 'Game Dev Jam', description: '48-hour game jam — build a playable game from scratch solo or in teams of up to 4, theme revealed at kickoff.',
    date: ahead(16), location: 'RVCE Computer Science Block', category: 'Game',
    prize: '₹15,000', imageUrl: photo('photo-1551650975-87deedd944c3', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: true,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_sneha', 'u_kabir'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 1),
  },
  {
    _id: 'e8', title: 'Inter-College Badminton Championship', description: 'Singles and doubles badminton championship open to all colleges in Bengaluru. Register solo or with a doubles partner.',
    date: ahead(25), location: 'RVCE Sports Complex', category: 'Sport',
    prize: 'Trophy + ₹10,000', imageUrl: photo('photo-1517694712202-14dd9538aa97', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: false,
    requireUSN: false, maxTeamSize: 2, attendees: ['u_ananya'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 4),
  },
  {
    _id: 'e9', title: 'FinTech Hack', description: 'Past edition: a hackathon focused on building fintech solutions for underbanked communities, in partnership with local startups.',
    date: ago(60 * 24 * 20), location: 'PES University Campus', category: 'Hackathon',
    prize: '₹75,000', imageUrl: photo('photo-1523580494863-6f3031224c94', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: true,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_me', 'u_aarav', 'u_rohan', 'u_arjun'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 40),
  },
  {
    _id: 'e10', title: 'Cloud & DevOps Bootcamp', description: 'Two-day hands-on bootcamp covering Docker, Kubernetes, CI/CD pipelines and AWS fundamentals for student developers.',
    date: ahead(30), location: 'Online (Zoom)', category: 'Workshop',
    prize: '', imageUrl: photo('photo-1492538368677-f6e0afe31dcc', 1200),
    organizer: 'u_org', collegeId: 'c0', isMultiCollege: true, allowTeamRegistration: false,
    requireUSN: false, maxTeamSize: 4, attendees: ['u_vikram', 'u_meera'],
    isApproved: true, isDeleted: false, createdAt: ago(60 * 24 * 1),
  },
]);

// Event registration records — mirrors EventParticipant.js
ensure('eventParticipants', () => {
  const list = [];
  (db.events || []).forEach((e) => {
    (e.attendees || []).forEach((uid) => {
      list.push({ _id: newId('ep'), eventId: e._id, userId: uid, teamId: null, registeredAt: e.createdAt, attended: false, attendedAt: null });
    });
  });
  return list;
});

// Auto-team matching queue — mirrors AutoTeamQueue.js. Pre-seed a few "other" users
// already queued for e1 (maxTeamSize 4) and e7 (maxTeamSize 4) so that when u_me
// joins, the match completes immediately (demonstrates the full match-found flow).
ensure('autoTeamQueue', () => [
  { _id: newId('atq'), userId: 'u_sneha', eventId: 'e1', filters: { college: 'PES University', location: 'Bengaluru', year: '3rd', role: 'Backend', skills: ['C++', 'DSA'] }, status: 'queued' },
  { _id: newId('atq'), userId: 'u_kabir', eventId: 'e1', filters: { college: 'BMS College of Engineering', location: 'Bengaluru', year: '3rd', role: 'Frontend', skills: ['React', 'Web3'] }, status: 'queued' },
  { _id: newId('atq'), userId: 'u_arjun', eventId: 'e1', filters: { college: 'RV College of Engineering', location: 'Bengaluru', year: '4th', role: 'Designer', skills: ['Security'] }, status: 'queued' },
]);

// Completed auto-team matches, keyed so EventDetails / MatchFoundModal have a stable team to show.
ensure('autoTeamMatches', () => []);

const QR_VALIDITY_MS = 5 * 60 * 1000;

function fakeSign(eventId, userId, ts) {
  // Demo signature — not cryptographically meaningful, just deterministic per request.
  return `${eventId}.${userId}.${ts}`.split('').reduce((a, c) => ((a * 31 + c.charCodeAt(0)) >>> 0), 7).toString(16);
}

function populateEvent(e) {
  return {
    ...e,
    organizer: pub(e.organizer),
    attendees: (e.attendees || []).map((uid) => pub(uid)).filter(Boolean),
  };
}

function populateEventList(e) {
  // getEvents only populates organizer (name/username/profilePic), attendees stay as ids
  return { ...e, organizer: pub(e.organizer) };
}

// ─── GET /events ────────────────────────────────────────────────────────────
route('get', '/events', ({ query }) => {
  const u = requireUser();
  let list = db.events.filter((e) => !e.isDeleted);

  if (query.organizerId) {
    list = list.filter((e) => e.organizer === query.organizerId);
  } else {
    list = list.filter((e) => e.isApproved);
  }

  if (query.joined === 'true') {
    list = list.filter((e) => (e.attendees || []).includes(u._id));
  }

  list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));

  const pageSize = Math.min(Number(query.limit) || 20, 100);
  const page = Number(query.pageNumber) || 1;
  const total = list.length;
  const paged = list.slice(pageSize * (page - 1), pageSize * page);

  return { events: paged.map(populateEventList), page, pages: Math.ceil(total / pageSize) };
});

// ─── POST /events ───────────────────────────────────────────────────────────
route('post', '/events', ({ body }) => {
  const u = requireUser();
  const allowedRoles = ['organizer', 'admin', 'moderator'];
  if (!allowedRoles.includes(u.role)) throw httpError(403, 'Only organizers, admins, and moderators can create events');

  const event = {
    _id: newId('e'),
    title: body.title || 'Untitled Event',
    description: body.description || '',
    date: body.date || ahead(7),
    location: body.location || 'TBA',
    category: body.category || 'Meetup',
    prize: body.prize || '',
    imageUrl: body.imageUrl || '',
    maxTeamSize: Number(body.maxTeamSize) || 4,
    isMultiCollege: body.isMultiCollege !== undefined ? (body.isMultiCollege === 'true' || body.isMultiCollege === true) : true,
    allowTeamRegistration: body.allowTeamRegistration === 'true' || body.allowTeamRegistration === true || false,
    requireUSN: body.requireUSN === 'true' || body.requireUSN === true || false,
    organizer: u._id,
    collegeId: u.collegeId || 'c0',
    attendees: [u._id],
    isApproved: true,
    isDeleted: false,
    createdAt: nowIso(),
  };
  db.events.unshift(event);
  return populateEventList(event);
});

// ─── GET /events/:id ────────────────────────────────────────────────────────
route('get', '/events/:id', ({ params }) => {
  requireUser();
  const e = db.events.find((x) => x._id === params.id && !x.isDeleted);
  if (!e) throw httpError(404, 'Event not found');
  return populateEvent(e);
});

// ─── PUT /events/:id ────────────────────────────────────────────────────────
route('put', '/events/:id', ({ params, body }) => {
  const u = requireUser();
  const e = db.events.find((x) => x._id === params.id);
  if (!e) throw httpError(404, 'Event not found');
  if (e.organizer !== u._id) throw httpError(401, 'Not authorized to update this event');

  e.title = body.title || e.title;
  e.description = body.description || e.description;
  e.date = body.date || e.date;
  e.location = body.location || e.location;
  e.category = body.category || e.category;
  e.prize = body.prize !== undefined ? body.prize : e.prize;
  e.maxTeamSize = body.maxTeamSize ? Number(body.maxTeamSize) : e.maxTeamSize;
  if (body.isMultiCollege !== undefined) e.isMultiCollege = body.isMultiCollege === 'true' || body.isMultiCollege === true;
  if (body.allowTeamRegistration !== undefined) e.allowTeamRegistration = body.allowTeamRegistration === 'true' || body.allowTeamRegistration === true;
  if (body.requireUSN !== undefined) e.requireUSN = body.requireUSN === 'true' || body.requireUSN === true;
  e.imageUrl = body.imageUrl !== undefined ? body.imageUrl : e.imageUrl;

  return populateEventList(e);
});

// ─── DELETE /events/:id ─────────────────────────────────────────────────────
route('delete', '/events/:id', ({ params }) => {
  const u = requireUser();
  const e = db.events.find((x) => x._id === params.id);
  if (!e) throw httpError(404, 'Event not found');
  if (e.organizer !== u._id) throw httpError(401, 'Not authorized to delete this event');
  e.isDeleted = true;
  e.deletedAt = nowIso();
  return { message: 'Event removed' };
});

// ─── PUT /events/:id/join ───────────────────────────────────────────────────
route('put', '/events/:id/join', ({ params }) => {
  const u = requireUser();
  const e = db.events.find((x) => x._id === params.id && !x.isDeleted);
  if (!e) throw httpError(404, 'Event not found');

  if (!e.isMultiCollege && e.collegeId && e.collegeId !== u.collegeId) {
    throw httpError(403, 'This event is restricted to students from the host college only.');
  }

  if (e.requireUSN && !u.usn) {
    const err = httpError(422, 'This event requires your USN. Please add it to your profile and try again.');
    err.code = 'USN_REQUIRED';
    throw err;
  }

  if ((e.attendees || []).includes(u._id)) throw httpError(400, 'User already attending');

  e.attendees = [...(e.attendees || []), u._id];

  db.eventParticipants = db.eventParticipants || [];
  if (!db.eventParticipants.some((p) => p.eventId === e._id && p.userId === u._id)) {
    db.eventParticipants.push({ _id: newId('ep'), eventId: e._id, userId: u._id, teamId: null, registeredAt: nowIso(), attended: false, attendedAt: null });
  }

  return populateEventList(e);
});

// ─── PUT /events/:id/leave ──────────────────────────────────────────────────
route('put', '/events/:id/leave', ({ params }) => {
  const u = requireUser();
  const e = db.events.find((x) => x._id === params.id);
  if (!e) throw httpError(404, 'Event not found');
  e.attendees = (e.attendees || []).filter((id) => id !== u._id);
  db.eventParticipants = (db.eventParticipants || []).filter((p) => !(p.eventId === e._id && p.userId === u._id));
  return { message: 'Left event' };
});

// ─── GET /events/:id/qr-payload ─────────────────────────────────────────────
route('get', '/events/:id/qr-payload', ({ params }) => {
  const u = requireUser();
  const e = db.events.find((x) => x._id === params.id);
  if (!e) throw httpError(404, 'Event not found');

  db.eventParticipants = db.eventParticipants || [];
  let participant = db.eventParticipants.find((p) => p.eventId === params.id && p.userId === u._id);

  if (!participant) {
    if (!(e.attendees || []).includes(u._id)) {
      throw httpError(403, 'You are not registered for this event.');
    }
    participant = { _id: newId('ep'), eventId: params.id, userId: u._id, teamId: null, registeredAt: nowIso(), attended: false, attendedAt: null };
    db.eventParticipants.push(participant);
  }

  const ts = Date.now();
  const sig = fakeSign(params.id, u._id, ts);
  return { eventId: params.id, userId: u._id, ts, sig, expiresIn: 300 };
});

// ─── GET /events/:id/teams ──────────────────────────────────────────────────
// Teams formed for a given event (via auto-team matching). Kept local to this
// handler file since cross-section db.teams is owned by the Teams section.
route('get', '/events/:id/teams', ({ params }) => {
  requireUser();
  const matches = (db.autoTeamMatches || []).filter((t) => t.eventId === params.id);
  return matches.map((t) => ({
    _id: t._id,
    name: t.name,
    description: t.description,
    isAutoCreated: true,
    members: t.memberIds.map((uid) => {
      const mu = findUser(uid);
      return mu ? { _id: mu._id, name: mu.name, username: mu.username, profilePic: mu.profilePic, skills: mu.skills, college: mu.college } : null;
    }).filter(Boolean),
  }));
});

// ─── Auto-Team Queue ────────────────────────────────────────────────────────

function tryMatch(eventId) {
  const event = db.events.find((e) => e._id === eventId);
  if (!event) return null;
  const targetSize = event.maxTeamSize || 4;
  const queued = (db.autoTeamQueue || []).filter((q) => q.eventId === eventId && q.status === 'queued');
  if (queued.length < targetSize) return null;

  const teamEntries = queued.slice(0, targetSize);
  teamEntries.forEach((q) => { q.status = 'matched'; });

  const team = {
    _id: newId('t'),
    chatId: newId('c'),
    eventId,
    name: `Auto-Team: ${event.title}`,
    description: `Automatically created team for ${event.title}`,
    memberIds: teamEntries.map((q) => q.userId),
    createdAt: nowIso(),
  };
  db.autoTeamMatches = db.autoTeamMatches || [];
  db.autoTeamMatches.push(team);
  return team;
}

// ─── POST /autoteam/:eventId/join ───────────────────────────────────────────
route('post', '/autoteam/:eventId/join', ({ params, body }) => {
  const u = requireUser();
  const { eventId } = params;
  const event = db.events.find((e) => e._id === eventId);
  if (!event) throw httpError(404, 'Event not found');

  db.autoTeamQueue = db.autoTeamQueue || [];
  const existing = db.autoTeamQueue.find((q) => q.userId === u._id && q.eventId === eventId && q.status === 'queued');
  if (existing) return { message: 'Already in queue', status: 'queued' };

  db.autoTeamQueue.push({ _id: newId('atq'), userId: u._id, eventId, filters: body.filters || {}, status: 'queued' });

  const team = tryMatch(eventId);

  if (team && team.memberIds.includes(u._id)) {
    // Broadcast to every matched member after a short delay, mirroring the real
    // backend's socket.io notification — EventDetails listens for 'team:found'.
    setTimeout(() => {
      serverEmit('team:found', {
        teamId: team._id,
        chatId: team.chatId,
        name: team.name,
        members: team.memberIds.length,
      });
    }, 2500);

    return { message: 'Team matched successfully! Redirecting...', status: 'matched', teamId: team._id, chatId: team.chatId };
  }

  return { message: 'Joined queue', status: 'queued' };
});

// ─── DELETE /autoteam/:eventId/leave ────────────────────────────────────────
route('delete', '/autoteam/:eventId/leave', ({ params }) => {
  const u = requireUser();
  db.autoTeamQueue = (db.autoTeamQueue || []).filter((q) => !(q.userId === u._id && q.eventId === params.eventId && q.status === 'queued'));
  return { message: 'Left queue' };
});

// ─── GET /autoteam/:eventId/status ──────────────────────────────────────────
route('get', '/autoteam/:eventId/status', ({ params }) => {
  const u = requireUser();
  const entry = (db.autoTeamQueue || []).find((q) => q.userId === u._id && q.eventId === params.eventId && q.status === 'queued');
  return { isQueued: !!entry };
});

// Demo API handlers for CHAT + STORIES/NOTES. See ../server.js for the route() helper.
import { db, ensure, newId, ago, nowIso, findUser, me, pub } from '../db';
import { route, httpError, requireUser } from '../server';
import { serverEmit, onClientEmit } from '@/fuseon-web/shims/socket';

// ---------------------------------------------------------------------------
// Fallback team info (teams.js owns real team data; this is only used if the
// Teams section hasn't seeded db.teams yet, or for t1/t2 specifically, so chat
// previews/team chats still render sensibly).
// ---------------------------------------------------------------------------
const FALLBACK_TEAMS = {
  t1: { _id: 't1', name: 'Code Crusaders', createdBy: 'u_me', members: ['u_me', 'u_priya', 'u_rohan', 'u_kabir'] },
  t2: { _id: 't2', name: 'Neural Ninjas', createdBy: 'u_aarav', members: ['u_aarav', 'u_sneha', 'u_meera'] },
};

function getTeam(teamId) {
  const real = db.teams?.find((t) => t._id === teamId);
  if (real) return real;
  return FALLBACK_TEAMS[teamId] || null;
}

// ---------------------------------------------------------------------------
// Seed chats (c1..c8) + a group chat + team chats (c_t1, c_t2) + messages.
// ---------------------------------------------------------------------------
ensure('messages', () => []);

ensure('chats', () => {
  const chats = [];
  const msgs = db.messages;

  const addMsg = (chatId, senderId, text, minsAgo, reactions = []) => {
    const m = {
      _id: newId('msg'), chatId, senderId, text, attachments: [],
      readBy: [senderId], reactions, createdAt: ago(minsAgo), updatedAt: ago(minsAgo),
    };
    msgs.push(m);
    return m;
  };

  const directChat = (id, otherId, unreadForMe, history) => {
    const chat = {
      _id: id, isGroupChat: false, teamId: null, chatName: '',
      participants: ['u_me', otherId],
      groupAdmin: null,
      unreadCounts: { u_me: unreadForMe, [otherId]: 0 },
      deletedBy: [],
      lastMessage: null,
      createdAt: ago(60 * 24 * 10),
      updatedAt: nowIso(),
    };
    history.forEach(([who, text, mins, reactions]) => {
      const senderId = who === 'me' ? 'u_me' : otherId;
      const m = addMsg(id, senderId, text, mins, reactions);
      chat.lastMessage = m._id;
    });
    chat.updatedAt = msgs.filter((m) => m.chatId === id).slice(-1)[0]?.createdAt || chat.createdAt;
    chats.push(chat);
    return chat;
  };

  directChat('c1', 'u_aarav', 2, [
    ['them', 'Hey! Are you joining the HackRVCE hackathon?', 190],
    ['me', 'Yeah definitely, already registered our team 🚀', 185],
    ['them', 'Nice, same here. Which track are you picking?', 182],
    ['me', 'Probably AI/ML, you?', 178],
    ['them', 'Web3 for us. Good luck!', 175, ['🔥']],
    ['them', 'Also, did you see the new project showcase forum post?', 20],
    ['them', 'Let me know if you want to grab coffee before the demo day.', 2],
  ]);

  directChat('c2', 'u_priya', 0, [
    ['me', 'Loved your Figma file for the landing page!', 1500],
    ['them', 'Thank you Dev! Glad it helped 😄', 1490],
    ['them', 'Sent you the updated banner assets.', 1200],
    ['me', 'Got them, looks great. Pushing to prod now.', 1195, ['👍']],
    ['them', 'Perfect, ping me once it is live.', 1190],
  ]);

  directChat('c3', 'u_rohan', 3, [
    ['them', 'The AWS deployment is throwing a 502 again.', 600],
    ['me', 'On it, checking the load balancer config.', 595],
    ['them', 'Found it — health check path was wrong.', 590],
    ['them', 'Fixed and redeployed. Can you confirm?', 40],
    ['them', 'All green on my end now ✅', 35],
  ]);

  directChat('c4', 'u_sneha', 0, [
    ['them', 'Good luck for the ICPC regionals prep!', 4000],
    ['me', 'Thanks! Solved the DP set you sent, really good practice.', 3990],
    ['them', 'Haha glad it helped. Want to do a mock contest this weekend?', 3980],
    ['me', 'Count me in.', 3975],
  ]);

  directChat('c5', 'u_kabir', 1, [
    ['them', 'Check out this new Solidity gas optimization trick', 300],
    ['me', 'Oh nice, sending you our contract for review', 295],
    ['them', 'Looks solid, just cache that storage read on line 40', 60],
  ]);

  directChat('c6', 'u_vikram', 0, [
    ['them', 'Our IoT sensor module finally works end to end 🎉', 9000],
    ['me', 'Awesome! Demo it at the tech talk?', 8990],
    ['them', 'Yes, already signed up for a slot.', 8985],
  ]);

  directChat('c7', 'u_meera', 0, [
    ['me', 'Hey, saw your Android app on the forum, really clean UI', 15000],
    ['them', 'Thank you so much!! Means a lot coming from you', 14990],
  ]);

  directChat('c8', 'u_arjun', 5, [
    ['them', 'Found a neat CTF writeup, sending the link', 120],
    ['them', 'Also are you free to pair up for the next CTF?', 100],
    ['them', 'Ping me whenever you are online', 10],
  ]);

  // Group chat (ad-hoc, not tied to a team)
  const groupId = 'c_group1';
  const groupMembers = ['u_me', 'u_aarav', 'u_priya', 'u_rohan'];
  const group = {
    _id: groupId, isGroupChat: true, teamId: null, chatName: 'HackRVCE Squad',
    participants: groupMembers, groupAdmin: 'u_me',
    unreadCounts: Object.fromEntries(groupMembers.map((m) => [m, m === 'u_me' ? 1 : 0])),
    deletedBy: [], lastMessage: null, createdAt: ago(60 * 24 * 5), updatedAt: nowIso(),
  };
  [
    ['u_aarav', 'Welcome to the squad chat for HackRVCE 6.0!', 400],
    ['u_priya', 'Excited! I will handle the UI 🎨', 395],
    ['u_rohan', 'I got the backend + deployment covered.', 390],
    ['u_me', 'I will glue it all together and work on the pitch deck.', 385, ['🎉']],
    ['u_aarav', 'Sounds like a plan. Standup tomorrow 9am?', 30],
  ].forEach(([who, text, mins, reactions]) => {
    const m = addMsg(groupId, who, text, mins, reactions);
    group.lastMessage = m._id;
  });
  group.updatedAt = msgs.filter((m) => m.chatId === groupId).slice(-1)[0]?.createdAt || group.createdAt;
  chats.push(group);

  // Team chats for t1 / t2
  ['t1', 't2'].forEach((teamId) => {
    const team = getTeam(teamId);
    if (!team) return;
    const members = Array.from(new Set([team.createdBy, ...(team.members || [])].filter(Boolean)));
    const chatId = `c_${teamId}`;
    const chat = {
      _id: chatId, isGroupChat: true, teamId, chatName: team.name,
      participants: members, groupAdmin: team.createdBy,
      unreadCounts: Object.fromEntries(members.map((m) => [m, 0])),
      deletedBy: [], lastMessage: null, createdAt: ago(60 * 24 * 20), updatedAt: nowIso(),
    };
    const seedLines = teamId === 't1'
      ? [
          ['u_priya', 'Pushed the new wireframes to Figma, take a look!', 500],
          ['u_rohan', 'Backend API for auth is done, docs attached.', 480],
          ['u_kabir', 'I will start on the smart contract integration.', 470],
          ['u_me', 'Great progress team, let\'s sync up tomorrow.', 60, ['👍']],
        ]
      : [
          ['u_sneha', 'Training the model on the new dataset now.', 700],
          ['u_meera', 'App build is passing CI, releasing a beta.', 650],
          ['u_aarav', 'Nice work everyone, demo prep this week.', 90],
        ];
    seedLines.forEach(([who, text, mins, reactions]) => {
      if (!members.includes(who)) return;
      const m = addMsg(chatId, who, text, mins, reactions);
      chat.lastMessage = m._id;
    });
    chat.updatedAt = msgs.filter((m) => m.chatId === chatId).slice(-1)[0]?.createdAt || chat.createdAt;
    chats.push(chat);
  });

  return chats;
});

// ---------------------------------------------------------------------------
// Stories / Notes (s1..)
// ---------------------------------------------------------------------------
ensure('stories', () => [
  { _id: 's1', userId: 'u_aarav', text: 'Grinding Kaggle before the hackathon 🧠', images: [], createdAt: ago(300) },
  { _id: 's2', userId: 'u_priya', text: 'New portfolio redesign dropping soon ✨', images: [], createdAt: ago(240) },
  { _id: 'r3', userId: 'u_rohan', text: 'Deploying on a Friday, wish me luck 😅', images: [], createdAt: ago(120) },
  { _id: 's4', userId: 'u_sneha', text: 'ICPC prep mode: ON', images: [], createdAt: ago(90) },
  { _id: 's5', userId: 'u_kabir', text: 'Gas fees got me down bad', images: [], createdAt: ago(60) },
  { _id: 's6', userId: 'u_vikram', text: 'Sensors finally talking to each other 🤖', images: [], createdAt: ago(30) },
]);

// ---------------------------------------------------------------------------
// Helpers to shape responses like the real backend's populate() calls.
// ---------------------------------------------------------------------------
const participantPub = (id) => {
  const u = findUser(id);
  if (!u) return { _id: id, name: 'Unknown User', email: '', profilePic: '' };
  return { _id: u._id, name: u.name, email: u.email, profilePic: u.profilePic, status: u.status || 'offline', lastSeen: u.lastActive || nowIso() };
};

const messageOut = (m) => ({
  _id: m._id,
  chatId: m.chatId,
  senderId: participantPub(m.senderId),
  text: m.text,
  attachments: m.attachments || [],
  readBy: m.readBy || [],
  reactions: m.reactions || [],
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

const lastMessageOut = (chat) => {
  const m = db.messages.find((x) => x._id === chat.lastMessage);
  return m ? messageOut(m) : null;
};

const chatOut = (chat) => ({
  _id: chat._id,
  isGroupChat: chat.isGroupChat,
  teamId: chat.teamId,
  chatName: chat.chatName,
  participants: chat.participants.map(participantPub),
  groupAdmin: chat.groupAdmin ? participantPub(chat.groupAdmin) : null,
  unreadCounts: chat.unreadCounts || {},
  deletedBy: chat.deletedBy || [],
  lastMessage: lastMessageOut(chat),
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt,
});

const visibleChats = (userId) => db.chats.filter((c) => c.participants.includes(userId) && !(c.deletedBy || []).includes(userId));

// ---------------------------------------------------------------------------
// Chat routes
// ---------------------------------------------------------------------------

// GET /chat — list user's chats
route('get', '/chat', () => {
  const u = requireUser();
  return visibleChats(u._id)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(chatOut);
});

function accessDirect(meId, otherId) {
  if (!otherId) throw httpError(400, 'UserId param not sent in request');
  if (!findUser(otherId)) throw httpError(404, 'User not found');
  let chat = db.chats.find((c) => !c.isGroupChat && c.participants.length === 2 && c.participants.includes(meId) && c.participants.includes(otherId));
  if (chat) {
    chat.deletedBy = (chat.deletedBy || []).filter((id) => id !== meId);
    return chatOut(chat);
  }
  chat = {
    _id: newId('c'), isGroupChat: false, teamId: null, chatName: '',
    participants: [meId, otherId], groupAdmin: null,
    unreadCounts: { [meId]: 0, [otherId]: 0 },
    deletedBy: [], lastMessage: null, createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.chats.push(chat);
  return chatOut(chat);
}

// POST /chat — the app's useChats hook posts { userId } here directly
route('post', '/chat', ({ body }) => {
  const u = requireUser();
  return accessDirect(u._id, body.userId);
});

// POST /chat/direct/:userId — matches the backend's REST route too
route('post', '/chat/direct/:userId', ({ params }) => {
  const u = requireUser();
  return accessDirect(u._id, params.userId);
});

// POST /chat/team/:teamId — access or create a team chat
route('post', '/chat/team/:teamId', ({ params }) => {
  const u = requireUser();
  const team = getTeam(params.teamId);
  if (!team) throw httpError(404, 'Team not found');
  const members = Array.from(new Set([team.createdBy, ...(team.members || [])].filter(Boolean)));
  if (!members.includes(u._id)) throw httpError(403, 'Only team members can access its chat');

  let chat = db.chats.find((c) => c.isGroupChat && c.teamId === params.teamId);
  if (chat) return chatOut(chat);

  chat = {
    _id: `c_${params.teamId}`, isGroupChat: true, teamId: params.teamId, chatName: team.name,
    participants: members, groupAdmin: team.createdBy,
    unreadCounts: Object.fromEntries(members.map((m) => [m, 0])),
    deletedBy: [], lastMessage: null, createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.chats.push(chat);
  return chatOut(chat);
});

// GET /chat/history/:chatId
route('get', '/chat/history/:chatId', ({ params, query }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === params.chatId);
  if (!chat || !chat.participants.includes(u._id)) throw httpError(403, 'Not a member of this chat');
  const limit = Math.min(parseInt(query.limit, 10) || 30, 100);
  let msgs = db.messages.filter((m) => m.chatId === params.chatId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (query.cursor) msgs = msgs.filter((m) => m.createdAt < query.cursor);
  const page = msgs.slice(-limit);
  return page.map(messageOut);
});

// POST /chat/send — HTTP fallback for sending (app mainly uses sockets)
route('post', '/chat/send', ({ body }) => {
  const u = requireUser();
  const { chatId, text, attachments } = body;
  if (!chatId || !text) throw httpError(400, 'Invalid data passed into request');
  const chat = db.chats.find((c) => c._id === chatId);
  if (!chat || !chat.participants.includes(u._id)) throw httpError(403, 'Not a member of this chat');
  const message = createMessage(chat, u._id, text, attachments || []);
  return { message: messageOut(message) };
});

// POST /chat/read
route('post', '/chat/read', ({ body }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === body.chatId);
  if (chat) {
    db.messages.filter((m) => m.chatId === chat._id && !m.readBy.includes(u._id)).forEach((m) => m.readBy.push(u._id));
    chat.unreadCounts = { ...(chat.unreadCounts || {}), [u._id]: 0 };
  }
  return { success: true };
});

// POST /chat/group
route('post', '/chat/group', ({ body }) => {
  const u = requireUser();
  if (!body.name || !body.users) throw httpError(400, 'Please fill all the fields');
  let users = [];
  try { users = JSON.parse(body.users); } catch { users = []; }
  if (users.length < 2) throw httpError(400, 'More than 2 users are required to form a group chat');
  const uniqueUsers = Array.from(new Set([...users, u._id]));
  const chat = {
    _id: newId('c'), isGroupChat: true, teamId: null, chatName: body.name,
    participants: uniqueUsers, groupAdmin: u._id,
    unreadCounts: Object.fromEntries(uniqueUsers.map((m) => [m, 0])),
    deletedBy: [], lastMessage: null, createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.chats.unshift(chat);
  return chatOut(chat);
});

// PUT /chat/rename
route('put', '/chat/rename', ({ body }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === body.chatId);
  if (!chat) throw httpError(404, 'Chat Not Found');
  if (chat.groupAdmin !== u._id) throw httpError(403, 'Only group admin can rename the group');
  chat.chatName = body.chatName;
  return chatOut(chat);
});

// PUT /chat/groupadd
route('put', '/chat/groupadd', ({ body }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === body.chatId);
  if (!chat) throw httpError(404, 'Chat Not Found');
  if (chat.groupAdmin !== u._id) throw httpError(403, 'Only group admin can add members');
  if (!chat.participants.includes(body.userId)) chat.participants.push(body.userId);
  chat.unreadCounts = { ...(chat.unreadCounts || {}), [body.userId]: 0 };
  return chatOut(chat);
});

// PUT /chat/groupremove
route('put', '/chat/groupremove', ({ body }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === body.chatId);
  if (!chat) throw httpError(404, 'Chat Not Found');
  if (chat.groupAdmin !== u._id) throw httpError(403, 'Only group admin can remove members');
  chat.participants = chat.participants.filter((p) => p !== body.userId);
  delete chat.unreadCounts[body.userId];
  return chatOut(chat);
});

// PUT /chat/leave
route('put', '/chat/leave', ({ body }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === body.chatId);
  if (!chat) throw httpError(404, 'Chat Not Found');
  chat.participants = chat.participants.filter((p) => p !== u._id);
  return { message: 'Left Group Successfully', chatId: body.chatId };
});

// PUT /chat/delete (hide for this user)
route('put', '/chat/delete', ({ body }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === body.chatId);
  if (!chat) throw httpError(404, 'Chat Not Found');
  chat.deletedBy = Array.from(new Set([...(chat.deletedBy || []), u._id]));
  return { message: 'Chat Deleted (Hidden)', chatId: body.chatId };
});

// GET /chat/:chatId — keep this registered LAST among /chat/* GETs so literal
// routes like /chat/history/:chatId are matched first (server.js prefers the
// route with more literal segments, so order here doesn't actually matter,
// but keeping it last mirrors the original Express router).
route('get', '/chat/:chatId', ({ params }) => {
  const u = requireUser();
  const chat = db.chats.find((c) => c._id === params.chatId);
  if (!chat) throw httpError(404, 'Chat not found');
  if (!chat.participants.includes(u._id)) throw httpError(403, 'Not a member of this chat');
  chat.deletedBy = (chat.deletedBy || []).filter((id) => id !== u._id);
  return chatOut(chat);
});

// ---------------------------------------------------------------------------
// Stories routes
// ---------------------------------------------------------------------------
const storyOut = (s) => ({ _id: s._id, userId: pub(s.userId) || { _id: s.userId, name: 'User' }, text: s.text, images: s.images || [], createdAt: s.createdAt, updatedAt: s.createdAt });

route('get', '/stories', () => {
  const u = requireUser();
  // Show everyone's stories for the demo (following + self), not TTL-expired (<24h)
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const visibleIds = new Set([...(u.following || []), u._id]);
  return db.stories
    .filter((s) => new Date(s.createdAt).getTime() > cutoff && (visibleIds.has(s.userId) || true)) // demo: show all so the strip never looks empty
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(storyOut);
});

route('post', '/stories', ({ body }) => {
  const u = requireUser();
  // Replace any existing note from this user (one active note per user, like the real "your story" slot)
  db.stories = db.stories.filter((s) => s.userId !== u._id);
  const story = { _id: newId('s'), userId: u._id, text: body.text || '', images: body.images || [], createdAt: nowIso() };
  db.stories.unshift(story);
  return storyOut(story);
});

route('delete', '/stories/:id', ({ params }) => {
  const u = requireUser();
  const story = db.stories.find((s) => s._id === params.id);
  if (!story) throw httpError(404, 'Story not found');
  if (story.userId !== u._id) throw httpError(401, 'Not authorized to delete this story');
  db.stories = db.stories.filter((s) => s._id !== params.id);
  return { message: 'Story removed successfully' };
});

// ---------------------------------------------------------------------------
// Socket simulation: message:send, typing, presence, reactions
// ---------------------------------------------------------------------------
function createMessage(chat, senderId, text, attachments = []) {
  const message = {
    _id: newId('msg'), chatId: chat._id, senderId, text, attachments,
    readBy: [senderId], reactions: [], createdAt: nowIso(), updatedAt: nowIso(),
  };
  db.messages.push(message);
  chat.lastMessage = message._id;
  chat.updatedAt = message.createdAt;
  chat.deletedBy = [];
  chat.participants.forEach((p) => {
    if (p !== senderId) chat.unreadCounts[p] = (chat.unreadCounts[p] || 0) + 1;
  });
  return message;
}

const CANNED_REPLIES = [
  "Haha true 😄", "On it, give me a sec.", "Sounds good to me!", "Let me check and get back to you.",
  "That's awesome, congrats!", "Can you send more details?", "Totally agree.", "Will do 👍",
  "Nice, let's catch up about this later.", "Thanks for the update!",
];

onClientEmit('message:send', ({ conversationId, text, attachments }) => {
  if (!conversationId || !text) return;
  const u = me();
  if (!u) return;
  const chat = db.chats.find((c) => c._id === conversationId);
  if (!chat || !chat.participants.includes(u._id)) return;

  const message = createMessage(chat, u._id, text, attachments || []);
  serverEmit('message:new', messageOut(message));

  // Simulate the other participant replying in direct chats (not groups).
  if (!chat.isGroupChat) {
    const otherId = chat.participants.find((p) => p !== u._id);
    if (!otherId) return;
    setTimeout(() => {
      serverEmit('typing:start', { userId: otherId });
      setTimeout(() => {
        serverEmit('typing:stop', { userId: otherId });
        const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
        const replyMsg = createMessage(chat, otherId, reply, []);
        serverEmit('message:new', messageOut(replyMsg));
      }, 1800);
    }, 900);
  }
});

onClientEmit('typing:start', ({ conversationId }) => {
  // Demo is single-tab, so there's no one else to notify; no-op kept for parity.
  void conversationId;
});
onClientEmit('typing:stop', ({ conversationId }) => {
  void conversationId;
});
onClientEmit('join:conversation', () => {});
onClientEmit('leave:conversation', () => {});

// Broadcast online presence periodically so the listener (attached shortly
// after login by SocketContext) is guaranteed to receive it quickly, and
// green "online" dots show up in the chat list/header.
function broadcastOnlineUsers() {
  const online = ['u_aarav', 'u_priya', 'u_rohan', 'u_sneha', 'u_kabir', 'u_vikram'];
  serverEmit('online:users', online);
}
if (typeof window !== 'undefined') {
  setTimeout(broadcastOnlineUsers, 400);
  setInterval(broadcastOnlineUsers, 5000);
}

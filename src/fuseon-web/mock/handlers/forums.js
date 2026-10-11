// Demo API handlers for FORUMS. See ../server.js for the route() helper.
import { db, ensure, newId, ago, nowIso, findUser, pub } from '../db';
import { route, httpError, requireUser } from '../server';

ensure('forums', () => [
  { _id: 'f1', name: 'General Discussion', description: 'Talk about anything campus life related.', icon: '💬', banner: '', creator: 'u_me', members: ['u_me', 'u_aarav', 'u_priya', 'u_rohan'], rules: ['Be respectful', 'No spam'], topics: ['general'], stats: { postsCount: 0, membersCount: 4 }, createdAt: ago(60 * 24 * 90) },
  { _id: 'f2', name: 'Tech & Programming', description: 'Share code, ask questions, discuss tech.', icon: '💻', banner: '', creator: 'u_aarav', members: ['u_aarav', 'u_rohan', 'u_kabir', 'u_me'], rules: ['Use code blocks', 'Search before asking'], topics: ['tech'], stats: { postsCount: 0, membersCount: 4 }, createdAt: ago(60 * 24 * 85) },
  { _id: 'f3', name: 'Project Showcase', description: 'Show off what you have been building.', icon: '🚀', banner: '', creator: 'u_priya', members: ['u_priya', 'u_me', 'u_meera'], rules: ['Include a demo link if possible'], topics: ['projects'], stats: { postsCount: 0, membersCount: 3 }, createdAt: ago(60 * 24 * 70) },
  { _id: 'f4', name: 'Career Advice', description: 'Internships, placements, resumes and more.', icon: '💼', banner: '', creator: 'u_ananya', members: ['u_ananya', 'u_vikram', 'u_me'], rules: ['No spam recruiters'], topics: ['career'], stats: { postsCount: 0, membersCount: 3 }, createdAt: ago(60 * 24 * 60) },
  { _id: 'f5', name: 'Help & Support', description: 'Stuck on something? Ask here.', icon: '🆘', banner: '', creator: 'u_arjun', members: ['u_arjun', 'u_sneha', 'u_me'], rules: ['Be specific about your problem'], topics: ['help'], stats: { postsCount: 0, membersCount: 3 }, createdAt: ago(60 * 24 * 50) },
]);

ensure('forumPosts', () => {
  const rows = [
    ['fp1', 'f1', 'u_me', 'general', 'Anyone else excited for HackRVCE 6.0?', 'Registrations just opened for HackRVCE 6.0! Who else is participating this year? Looking to team up with frontend folks.', ['hackathon', 'rvce'], 420, 34, 2],
    ['fp2', 'f1', 'u_priya', 'general', 'Best cafes near campus for late-night study sessions', 'Found this great 24-hour cafe near the RVCE back gate, perfect for cramming before exams. Any other recommendations?', ['campus', 'food'], 260, 18, 0],
    ['fp3', 'f2', 'u_aarav', 'tech', 'TensorFlow vs PyTorch in 2024 — which one are you using?', 'Been using TensorFlow for 2 years but a lot of research papers now ship PyTorch code. Curious what this community prefers for new projects.', ['ml', 'python'], 900, 52, 1],
    ['fp4', 'f2', 'u_rohan', 'tech', 'Deploying Node apps on a student budget', 'Sharing my stack: Railway + MongoDB Atlas free tier + Cloudflare. Anyone found cheaper alternatives?', ['nodejs', 'devops'], 500, 29, 0],
    ['fp5', 'f2', 'u_kabir', 'tech', 'Gas optimization tips for Solidity contracts', 'Learned the hard way that storage reads are expensive. Sharing a few patterns that cut our gas costs by 30%.', ['solidity', 'web3'], 310, 41, 0],
    ['fp6', 'f3', 'u_priya', 'projects', 'Launched my portfolio redesign — feedback welcome!', 'Spent the last month rebuilding my portfolio with Framer Motion. Would love some design feedback from this community.', ['portfolio', 'design'], 610, 63, 3],
    ['fp7', 'f3', 'u_meera', 'projects', 'Built a campus food-ordering Android app', 'Final year project: an Android app for ordering from campus canteens with live queue tracking. Open to feature suggestions!', ['android', 'kotlin'], 380, 24, 1],
    ['fp8', 'f3', 'u_me', 'projects', 'Fuseon — a campus network for events, teams & communities', 'Building Fuseon to help students find hackathon teammates, events and communities on campus. Would love early feedback!', ['react', 'startup'], 980, 77, 4],
    ['fp9', 'f4', 'u_ananya', 'career', 'How I landed a PM internship at a fintech startup', 'Sharing my resume structure and interview prep notes for anyone targeting product roles this placement season.', ['career', 'internship'], 1200, 95, 5],
    ['fp10', 'f4', 'u_vikram', 'career', 'Is a core embedded systems career still worth it?', 'Everyone around me is going into software/web dev. Curious if hardware/embedded roles are still in demand.', ['career', 'hardware'], 340, 22, 2],
    ['fp11', 'f5', 'u_arjun', 'help', 'Stuck debugging a segfault in my OS assignment', 'Getting a segfault only in release builds, works fine in debug. Any common gotchas I should check for?', ['c', 'debugging'], 150, 9, 0],
    ['fp12', 'f5', 'u_sneha', 'help', 'Need help picking a DP practice sheet for ICPC prep', 'Looking for a solid roadmap for dynamic programming before regionals. What worked for you all?', ['dsa', 'competitive-programming'], 200, 14, 1],
  ];
  return rows.map(([_id, forum, author, category, title, content, tags, minsAgo, views, replies]) => ({
    _id, forum, author, category, title, content, image: '', tags,
    likes: [], dislikes: [], views, repliesCount: replies, isSolved: false, isDeleted: false,
    savedBy: [], createdAt: ago(minsAgo), lastActivity: ago(Math.max(minsAgo - 5, 1)),
  }));
});

ensure('forumReplies', () => {
  const now = (m) => ago(m);
  const rows = [
    ['fr1', 'fp1', 'u_aarav', 'Count me in! Looking for a backend dev for my team.', 400],
    ['fr2', 'fp1', 'u_rohan', 'I am down, DM me your team details.', 390],
    ['fr8', 'fp6', 'u_me', 'The animations are so smooth, great work!', 600],
    ['fr9', 'fp6', 'u_rohan', 'Loading time could be improved a bit but looks great overall.', 580],
    ['fr10', 'fp6', 'u_sneha', 'Love the color palette 🔥', 560],
    ['fr11', 'fp8', 'u_priya', 'This is exactly what our campus needs!', 950],
    ['fr12', 'fp8', 'u_kabir', 'Would love to contribute, is it open source?', 900],
    ['fr13', 'fp8', 'u_meera', 'The team-matching idea is brilliant.', 850],
    ['fr14', 'fp8', 'u_me', 'Yes! Will open-source the core soon.', 800],
    ['fr15', 'fp9', 'u_me', 'This is super helpful, thank you for sharing!', 1150],
    ['fr16', 'fp9', 'u_vikram', 'Saving this for my own applications.', 1100],
    ['fr17', 'fp9', 'u_sneha', 'What tools did you use for mock interviews?', 1050],
    ['fr18', 'fp9', 'u_ananya', 'Pramp and friends mostly!', 1000],
    ['fr19', 'fp9', 'u_arjun', 'Great breakdown, bookmarking this thread.', 980],
    ['fr20', 'fp12', 'u_me', 'Striver\'s DP sheet worked great for me.', 180],
  ];
  return rows.map(([_id, post, author, content, minsAgo]) => ({
    _id, post, author, content, parentReply: null, likes: [], dislikes: [], createdAt: now(minsAgo),
  }));
});

const forumOut = (f) => ({
  _id: f._id, name: f.name, description: f.description, icon: f.icon, banner: f.banner,
  creator: pub(f.creator), members: f.members, rules: f.rules, topics: f.topics,
  stats: { postsCount: db.forumPosts.filter((p) => p.forum === f._id && !p.isDeleted).length, membersCount: f.members.length },
  createdAt: f.createdAt, updatedAt: f.createdAt,
});

const forumLite = (id) => {
  const f = db.forums.find((x) => x._id === id);
  return f ? { _id: f._id, name: f.name, icon: f.icon } : null;
};

const postOut = (p, { withReplies } = {}) => {
  const base = {
    _id: p._id, title: p.title, content: p.content, image: p.image,
    author: pub(p.author), forum: forumLite(p.forum), category: p.category,
    likes: p.likes, dislikes: p.dislikes, views: p.views, tags: p.tags,
    lastActivity: p.lastActivity, isSolved: p.isSolved, repliesCount: p.repliesCount,
    createdAt: p.createdAt, updatedAt: p.lastActivity,
  };
  if (withReplies) {
    base.replies = db.forumReplies
      .filter((r) => r.post === p._id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(replyOut);
  }
  return base;
};

const replyOut = (r) => ({
  _id: r._id, content: r.content, author: pub(r.author), post: r.post,
  parentReply: r.parentReply, likes: r.likes, dislikes: r.dislikes, createdAt: r.createdAt, updatedAt: r.createdAt,
});

// ---------------------------------------------------------------------------
// Forums
// ---------------------------------------------------------------------------
route('get', '/forums', () => {
  requireUser();
  return db.forums.slice().sort((a, b) => b.members.length - a.members.length).map(forumOut);
});

route('post', '/forums', ({ body }) => {
  const u = requireUser();
  if (!body.name) throw httpError(400, 'Invalid forum data');
  if (db.forums.some((f) => f.name === body.name)) throw httpError(400, 'Forum with this name already exists');
  const forum = {
    _id: newId('f'), name: body.name, description: body.description || '', icon: body.icon || '🗂️', banner: body.banner || '',
    creator: u._id, members: [u._id], rules: body.rules || [], topics: body.topics || [], createdAt: nowIso(),
  };
  db.forums.push(forum);
  return forumOut(forum);
});

route('get', '/forums/posts/feed', ({ query }) => {
  requireUser();
  let posts = db.forumPosts.filter((p) => !p.isDeleted);
  if (query.search) {
    const q = String(query.search).toLowerCase();
    posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }
  posts = posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 10, 100);
  const start = (page - 1) * limit;
  const sliced = posts.slice(start, start + limit);
  return { posts: sliced.map((p) => postOut(p)), page, pages: Math.ceil(posts.length / limit), total: posts.length };
});

route('get', '/forums/posts/search', ({ query }) => {
  requireUser();
  const q = String(query.q || '').toLowerCase();
  if (!q) return [];
  return db.forumPosts
    .filter((p) => !p.isDeleted && (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))))
    .map((p) => postOut(p));
});

// GET /forums/posts?sort=latest|top|unanswered — used by ForumHome (global feed)
route('get', '/forums/posts', ({ query }) => {
  requireUser();
  let posts = db.forumPosts.filter((p) => !p.isDeleted);
  if (query.sort === 'top') posts = posts.slice().sort((a, b) => b.likes.length - a.likes.length || b.views - a.views);
  else if (query.sort === 'unanswered') posts = posts.filter((p) => p.repliesCount === 0);
  else posts = posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return posts.map((p) => postOut(p));
});

// POST /forums/posts — CreateForumModal posts straight here without choosing a forum,
// so route it into the forum matching the chosen category (fallback: General Discussion).
route('post', '/forums/posts', ({ body }) => {
  const u = requireUser();
  if (!body.title || !body.content) throw httpError(400, 'Title and content are required');
  const forum = db.forums.find((f) => f.topics.includes(body.category)) || db.forums.find((f) => f._id === 'f1');
  const post = {
    _id: newId('fp'), forum: forum._id, author: u._id, category: body.category || forum.topics[0] || 'general',
    title: body.title, content: body.content, image: body.image || '', tags: body.tags || [],
    likes: [], dislikes: [], views: 0, repliesCount: 0, isSolved: false, isDeleted: false, savedBy: [],
    createdAt: nowIso(), lastActivity: nowIso(),
  };
  db.forumPosts.unshift(post);
  forum.stats = { ...(forum.stats || {}), postsCount: (forum.stats?.postsCount || 0) + 1 };
  return postOut(post);
});

route('get', '/forums/:id', ({ params }) => {
  requireUser();
  const forum = db.forums.find((f) => f._id === params.id);
  if (!forum) throw httpError(404, 'Forum not found');
  return forumOut(forum);
});

route('put', '/forums/:id/join', ({ params }) => {
  const u = requireUser();
  const forum = db.forums.find((f) => f._id === params.id);
  if (!forum) throw httpError(404, 'Forum not found');
  if (forum.members.includes(u._id)) throw httpError(400, 'User already a member');
  forum.members.push(u._id);
  return forumOut(forum);
});

route('put', '/forums/:id/leave', ({ params }) => {
  const u = requireUser();
  const forum = db.forums.find((f) => f._id === params.id);
  if (!forum) throw httpError(404, 'Forum not found');
  forum.members = forum.members.filter((m) => m !== u._id);
  return forumOut(forum);
});

route('post', '/forums/:id/posts', ({ params, body }) => {
  const u = requireUser();
  const forum = db.forums.find((f) => f._id === params.id);
  if (!forum) throw httpError(404, 'Forum not found');
  const post = {
    _id: newId('fp'), forum: forum._id, author: u._id, category: forum.topics[0] || 'general',
    title: body.title, content: body.content, image: body.image || '', tags: body.tags || [],
    likes: [], dislikes: [], views: 0, repliesCount: 0, isSolved: false, isDeleted: false, savedBy: [],
    createdAt: nowIso(), lastActivity: nowIso(),
  };
  db.forumPosts.unshift(post);
  forum.stats = { ...(forum.stats || {}), postsCount: (forum.stats?.postsCount || 0) + 1 };
  return postOut(post);
});

route('get', '/forums/:id/posts', ({ params, query }) => {
  requireUser();
  let posts = db.forumPosts.filter((p) => p.forum === params.id && !p.isDeleted);
  if (query.sort === 'top') posts = posts.slice().sort((a, b) => b.likes.length - a.likes.length);
  else if (query.sort === 'trending') posts = posts.slice().sort((a, b) => b.views - a.views);
  else posts = posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const start = (page - 1) * limit;
  const sliced = posts.slice(start, start + limit);
  return { posts: sliced.map((p) => postOut(p)), page, pages: Math.ceil(posts.length / limit), total: posts.length };
});

// GET /forums/posts/:id — ThreadPage expects the post fields flattened + a `replies` array
route('get', '/forums/posts/:id', ({ params }) => {
  requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id && !p.isDeleted);
  if (!post) throw httpError(404, 'Post not found');
  post.views += 1;
  return postOut(post, { withReplies: true });
});

// POST /forums/posts/:id/replies — ForumReplyList posts here
route('post', '/forums/posts/:id/replies', ({ params, body }) => {
  const u = requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  const reply = { _id: newId('fr'), post: params.id, author: u._id, content: body.content, parentReply: body.parentReplyId || null, likes: [], dislikes: [], createdAt: nowIso() };
  db.forumReplies.push(reply);
  post.repliesCount += 1;
  post.lastActivity = nowIso();
  return replyOut(reply);
});

// Backend-style alias: POST /forums/post/:id/reply
route('post', '/forums/post/:id/reply', ({ params, body }) => {
  const u = requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  const reply = { _id: newId('fr'), post: params.id, author: u._id, content: body.content, parentReply: body.parentReplyId || null, likes: [], dislikes: [], createdAt: nowIso() };
  db.forumReplies.push(reply);
  post.repliesCount += 1;
  post.lastActivity = nowIso();
  return replyOut(reply);
});

// Backend-style alias: GET /forums/post/:id (post + replies)
route('get', '/forums/post/:id', ({ params }) => {
  requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id && !p.isDeleted);
  if (!post) throw httpError(404, 'Post not found');
  post.views += 1;
  const replies = db.forumReplies.filter((r) => r.post === post._id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(replyOut);
  return { post: postOut(post), replies };
});

route('put', '/forums/posts/:id/like', ({ params }) => {
  const u = requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  post.dislikes = post.dislikes.filter((id) => id !== u._id);
  if (post.likes.includes(u._id)) post.likes = post.likes.filter((id) => id !== u._id);
  else post.likes.push(u._id);
  return postOut(post);
});

route('put', '/forums/posts/:id/dislike', ({ params }) => {
  const u = requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  post.likes = post.likes.filter((id) => id !== u._id);
  if (post.dislikes.includes(u._id)) post.dislikes = post.dislikes.filter((id) => id !== u._id);
  else post.dislikes.push(u._id);
  return postOut(post);
});

route('put', '/forums/posts/:id/save', ({ params }) => {
  const u = requireUser();
  const post = db.forumPosts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  post.savedBy = post.savedBy || [];
  if (post.savedBy.includes(u._id)) post.savedBy = post.savedBy.filter((id) => id !== u._id);
  else post.savedBy.push(u._id);
  u.savedPosts = post.savedBy.includes(u._id) ? Array.from(new Set([...(u.savedPosts || []), post._id])) : (u.savedPosts || []).filter((id) => id !== post._id);
  return postOut(post);
});

route('post', '/forums/posts/:id/report', () => {
  requireUser();
  return { message: 'Post reported. Our moderators will review it shortly.' };
});

route('put', '/forums/replies/:id/like', ({ params }) => {
  const u = requireUser();
  const reply = db.forumReplies.find((r) => r._id === params.id);
  if (!reply) throw httpError(404, 'Reply not found');
  reply.dislikes = reply.dislikes.filter((id) => id !== u._id);
  if (reply.likes.includes(u._id)) reply.likes = reply.likes.filter((id) => id !== u._id);
  else reply.likes.push(u._id);
  return replyOut(reply);
});

route('put', '/forums/replies/:id/dislike', ({ params }) => {
  const u = requireUser();
  const reply = db.forumReplies.find((r) => r._id === params.id);
  if (!reply) throw httpError(404, 'Reply not found');
  reply.likes = reply.likes.filter((id) => id !== u._id);
  if (reply.dislikes.includes(u._id)) reply.dislikes = reply.dislikes.filter((id) => id !== u._id);
  else reply.dislikes.push(u._id);
  return replyOut(reply);
});

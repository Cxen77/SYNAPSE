// Demo API handlers: all /posts* endpoints + GET /home (feed, recommendations)
import { db, ensure, newId, ago, nowIso, findUser, me, pub, photo, avatar } from '../db';
import { route, httpError, requireUser } from '../server';
import { notify } from './core';

// ---------- seed posts ----------
ensure('posts', () => [
  { _id: 'p1', user: 'u_me', content: "Just shipped the first working prototype of Fuseon! 🚀 Building a campus network for hackathons, teams and events. Would love feedback from fellow RVCE folks.", image: photo('photo-1551650975-87deedd944c3'), likes: ['u_aarav', 'u_priya', 'u_rohan', 'u_sneha'], commentsCount: 2, attachedTeamId: 't1', attachedEventId: null, isDeleted: false, createdAt: ago(60 * 3) },
  { _id: 'p2', user: 'u_aarav', content: "Our ML team (Neural Ninjas) is looking for 2 more frontend devs for HackRVCE 6.0! Drop a comment if interested 👇", image: '', likes: ['u_me', 'u_priya'], commentsCount: 1, attachedTeamId: 't3', attachedEventId: 'e1', isDeleted: false, createdAt: ago(60 * 8) },
  { _id: 'p3', user: 'u_priya', content: "Redesigned the onboarding flow for our college fest app. Figma file link in comments. Feedback welcome! ✨", image: photo('photo-1515187029135-18ee286d815b'), likes: ['u_me', 'u_kabir', 'u_sneha'], commentsCount: 0, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 20) },
  { _id: 'p4', user: 'u_rohan', content: "Deployed my first AWS Lambda pipeline today. Serverless is wild 🤯 Anyone else working with AWS at RVCE?", image: '', likes: ['u_me'], commentsCount: 1, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 30) },
  { _id: 'p5', user: 'u_sneha', content: "Solved 5 ICPC regional problems today. Competitive programming grind never stops 💻", image: photo('photo-1517694712202-14dd9538aa97'), likes: ['u_me', 'u_aarav', 'u_vikram', 'u_meera', 'u_arjun'], commentsCount: 0, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 50) },
  { _id: 'p6', user: 'u_kabir', content: "Our Web3 dApp just hit testnet! Smart contracts for campus event ticketing, fully on-chain. Would love beta testers.", image: photo('photo-1522202176988-66273c2fd55f'), likes: ['u_me'], commentsCount: 0, attachedTeamId: null, attachedEventId: 'e2', isDeleted: false, createdAt: ago(60 * 70) },
  { _id: 'p7', user: 'u_ananya', content: "Had an amazing time at the growth marketing workshop today. Key takeaway: distribution > product in the early days.", image: '', likes: [], commentsCount: 0, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 100) },
  { _id: 'p8', user: 'u_vikram', content: "Finally got my IoT soil-moisture sensor talking to Firebase over MQTT. Smart farming side project is alive! 🌱", image: photo('photo-1523580494863-6f3031224c94'), likes: ['u_me', 'u_arjun'], commentsCount: 0, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 140) },
  { _id: 'p9', user: 'u_meera', content: "Published my first Android app built fully in Jetpack Compose on the Play Store! Link in bio 📱", image: photo('photo-1492538368677-f6e0afe31dcc'), likes: ['u_priya'], commentsCount: 0, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 200) },
  { _id: 'p10', user: 'u_arjun', content: "Placed top-10 in a national CTF this weekend. Cybersecurity folks at RVCE, let's form a club!", image: '', likes: ['u_me', 'u_vikram'], commentsCount: 0, attachedTeamId: null, attachedEventId: null, isDeleted: false, createdAt: ago(60 * 260) },
]);

ensure('comments', () => [
  { _id: 'cm1', post: 'p1', user: 'u_priya', text: "This looks amazing! Can't wait to try it out 🔥", parentComment: null, createdAt: ago(60 * 2) },
  { _id: 'cm2', post: 'p1', user: 'u_sneha', text: "@priya same here, the UI looks super clean", parentComment: null, createdAt: ago(55) },
  { _id: 'cm3', post: 'p1', user: 'u_me', text: "Thanks @priya means a lot!", parentComment: 'cm1', createdAt: ago(40) },
  { _id: 'cm4', post: 'p2', user: 'u_me', text: "I'd love to join, I do React + Tailwind!", parentComment: null, createdAt: ago(60 * 7) },
  { _id: 'cm5', post: 'p4', user: 'u_kabir', text: "Yep, using Lambda for our Web3 webhook listeners too.", parentComment: null, createdAt: ago(60 * 25) },
]);

function populateComment(c) {
  return { ...c, user: pub(c.user) };
}

function attachedTeamFor(teamId) {
  const t = db.teams?.find((x) => x._id === teamId);
  if (!t) return null;
  return {
    _id: t._id,
    name: t.name,
    category: t.category,
    isLookingForMembers: t.isLookingForMembers,
    openRoles: (t.openRoles || []).filter((r) => r.isOpen).slice(0, 5).map((r) => ({ _id: r._id, title: r.title })),
    membersCount: Array.isArray(t.members) ? t.members.length : 0,
  };
}

function attachedEventFor(eventId) {
  const e = db.events?.find((x) => x._id === eventId);
  if (!e) return null;
  return { _id: e._id, title: e.title, category: e.category, date: e.date, location: e.location, imageUrl: e.imageUrl };
}

function formatPost(p, viewerId) {
  const likes = p.likes || [];
  return {
    _id: p._id,
    user: pub(p.user),
    content: p.content,
    image: p.image,
    likes,
    likesCount: likes.length,
    commentsCount: p.commentsCount || 0,
    likedByUser: likes.includes(viewerId),
    createdAt: p.createdAt,
    attachedTeam: p.attachedTeamId ? attachedTeamFor(p.attachedTeamId) : null,
    hasAttachedTeam: !!p.attachedTeamId,
    attachedEvent: p.attachedEventId ? attachedEventFor(p.attachedEventId) : null,
    hasAttachedEvent: !!p.attachedEventId,
  };
}

// ---------- GET /posts ----------
route('get', '/posts', ({ query }) => {
  const u = requireUser();
  const pageSize = Math.min(Number(query.limit) || 10, 100);
  const page = Number(query.pageNumber) || 1;
  let list = db.posts.filter((p) => !p.isDeleted);

  if (query.filter === 'following') {
    const following = u.following || [];
    list = list.filter((p) => following.includes(p.user));
  } else if (query.userId) {
    list = list.filter((p) => p.user === query.userId);
  }

  list = list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = list.length;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const paged = list.slice(pageSize * (page - 1), pageSize * page);

  return { posts: paged.map((p) => formatPost(p, u._id)), page, pages };
});

// ---------- POST /posts ----------
route('post', '/posts', ({ body }) => {
  const u = requireUser();
  const content = body.content || '';
  const image = body.image || '';
  if (!content.trim() && !image) throw httpError(400, 'Post must have content or an image');

  let attachedTeamId = null;
  if (body.attachedTeamId) {
    const team = db.teams?.find((t) => t._id === body.attachedTeamId);
    if (!team) throw httpError(400, 'Team not found');
    if (team.createdBy !== u._id && team.leader !== u._id) throw httpError(400, 'You can only attach teams you own');
    attachedTeamId = team._id;
  }

  let attachedEventId = null;
  if (body.attachedEventId) {
    const event = db.events?.find((e) => e._id === body.attachedEventId);
    if (!event) throw httpError(400, 'Event not found');
    attachedEventId = event._id;
  }

  const post = { _id: newId('p'), user: u._id, content, image, likes: [], commentsCount: 0, attachedTeamId, attachedEventId, isDeleted: false, createdAt: nowIso() };
  db.posts.unshift(post);
  return formatPost(post, u._id);
});

// ---------- DELETE /posts/:id ----------
route('delete', '/posts/:id', ({ params }) => {
  const u = requireUser();
  const post = db.posts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  if (post.user !== u._id) throw httpError(401, 'Not authorized');
  post.isDeleted = true;
  post.deletedAt = nowIso();
  return { message: 'Post removed' };
});

// ---------- PUT /posts/:id/like ----------
route('put', '/posts/:id/like', ({ params }) => {
  const u = requireUser();
  const post = db.posts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  post.likes = post.likes || [];
  let likedByUser;
  if (post.likes.includes(u._id)) {
    post.likes = post.likes.filter((id) => id !== u._id);
    likedByUser = false;
  } else {
    post.likes.push(u._id);
    likedByUser = true;
    notify(post.user, u._id, 'like', 'liked your post', { post: post._id });
  }
  return { postId: post._id, likesCount: post.likes.length, likedByUser };
});

// ---------- GET /posts/:id/comments ----------
route('get', '/posts/:id/comments', ({ params }) => {
  requireUser();
  const post = db.posts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  const top = db.comments.filter((c) => c.post === params.id && !c.parentComment).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return top.map((c) => {
    const replies = db.comments.filter((r) => r.parentComment === c._id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(populateComment);
    return { ...populateComment(c), replies };
  });
});

// ---------- POST /posts/:id/comments ----------
route('post', '/posts/:id/comments', ({ params, body }) => {
  const u = requireUser();
  const post = db.posts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  const comment = { _id: newId('cm'), post: params.id, user: u._id, text: body.text || '', parentComment: body.parentCommentId || null, createdAt: nowIso() };
  db.comments.push(comment);
  post.commentsCount = (post.commentsCount || 0) + 1;
  if (post.user !== u._id) {
    notify(post.user, u._id, comment.parentComment ? 'reply' : 'comment', comment.parentComment ? 'replied to a comment' : 'commented on your post', { post: post._id });
  }
  return populateComment(comment);
});

// ---------- POST /posts/:id/comments/:commentId/replies ----------
// Not part of original backend routes, but PostCard.jsx calls this for replies.
route('post', '/posts/:id/comments/:commentId/replies', ({ params, body }) => {
  const u = requireUser();
  const post = db.posts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  const parent = db.comments.find((c) => c._id === params.commentId);
  if (!parent) throw httpError(404, 'Comment not found');
  const reply = { _id: newId('cm'), post: params.id, user: u._id, text: body.text || '', parentComment: parent._id, createdAt: nowIso() };
  db.comments.push(reply);
  post.commentsCount = (post.commentsCount || 0) + 1;
  if (post.user !== u._id) notify(post.user, u._id, 'reply', 'replied to a comment', { post: post._id });
  if (parent.user !== u._id) notify(parent.user, u._id, 'reply', 'replied to your comment', { post: post._id });
  return populateComment(reply);
});

// ---------- DELETE /posts/:id/comments/:commentId ----------
route('delete', '/posts/:id/comments/:commentId', ({ params }) => {
  const u = requireUser();
  const post = db.posts.find((p) => p._id === params.id);
  if (!post) throw httpError(404, 'Post not found');
  const comment = db.comments.find((c) => c._id === params.commentId);
  if (!comment) throw httpError(404, 'Comment not found');
  if (comment.user !== u._id && post.user !== u._id) throw httpError(401, 'User not authorized to delete this comment');
  db.comments = db.comments.filter((c) => c._id !== params.commentId && c.parentComment !== params.commentId);
  post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
  return { message: 'Comment removed' };
});

// ---------- GET /home ----------
route('get', '/home', () => {
  const u = requireUser();
  const feedPosts = db.posts.filter((p) => !p.isDeleted).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  const recommendedPeople = db.users.filter((x) => x._id !== u._id && !(u.following || []).includes(x._id)).slice(0, 5).map(pub);
  const openTeams = (db.teams || []).filter((t) => t.isLookingForMembers && t.visibility === 'public' && t.teamStatus === 'active').slice(0, 5);
  const trendingEvents = (db.events || []).filter((e) => !e.isDeleted).slice().sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);

  return {
    profile: u,
    feed: { posts: feedPosts.map((p) => formatPost(p, u._id)), page: 1, pages: Math.max(1, Math.ceil(db.posts.filter((p) => !p.isDeleted).length / 10)) },
    recommendedPeople,
    openTeams,
    trendingEvents,
  };
});

const initialChats = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "Active 5m ago",
    note: "🎮 Gaming tonight! I'm planning to stream the whole tournament if the internet holds up.",
    messages: [
      { id: 1, from: "them", text: "Hey! Did you finish the hackathon submission?", timestamp: "10:30 AM", reactions: [] },
      { id: 2, from: "me", text: "Almost! Just polishing the UI. 😅", timestamp: "10:31 AM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Cool! I'm testing the backend now.", timestamp: "10:32 AM", reactions: [] },
      { id: 4, from: "me", text: "The new UI animations are smooth!", timestamp: "10:45 AM", reactions: [] },
      { id: 5, from: "them", text: "Nice! Send me the demo link when you're done.", timestamp: "10:46 AM", reactions: ["👌"] },
      { id: 6, from: "me", text: "Will do. Should be live in 10 minutes.", timestamp: "10:50 AM", reactions: [], seen: true },
      { id: 7, from: "them", text: "Got it, I'll check it out right away.", timestamp: "10:52 AM", reactions: ["🎉"] },
      { id: 8, from: "me", text: "Just pushed the final commit to the main branch.", timestamp: "10:55 AM", reactions: [], seen: true },
      { id: 9, from: "them", text: "Perfect timing! See you at the live stream tonight.", timestamp: "10:57 AM", reactions: ["🎉"] },
      { id: 10, from: "me", text: "Looking forward to it! Don't forget the pizza order 🍕", timestamp: "10:58 AM", reactions: ["😂"], seen: true },
    ],
  },

  {
    id: 2,
    name: "Bob Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "Active 2h ago",
    note: "💻 Coding non-stop for the next two days, don't disturb me unless it's an emergency.",
    messages: [
      { id: 1, from: "them", text: "Are we ready for the gaming tournament tonight?", timestamp: "11:00 AM", reactions: [] },
      { id: 2, from: "me", text: "Yep! My character is fully upgraded 🗡️", timestamp: "11:01 AM", reactions: ["🔥"], seen: true },
      { id: 3, from: "them", text: "Awesome! Let's win this.", timestamp: "11:02 AM", reactions: ["🎉"] },
      { id: 4, from: "me", text: "I found a new hidden item that gives a huge attack boost!", timestamp: "11:10 AM", reactions: [], seen: true },
      { id: 5, from: "them", text: "No way! Where is it?", timestamp: "11:11 AM", reactions: ["💡"] },
      { id: 6, from: "me", text: "I'll show you in the lobby right before the match starts.", timestamp: "11:15 AM", reactions: [], seen: true },
      { id: 7, from: "them", text: "Sounds good, I'm logging on now.", timestamp: "11:20 AM", reactions: ["👍"] },
    ],
  },

  {
    id: 3,
    name: "Charlie Lee",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    status: "Active 1h ago",
    note: "📚 Studying for the final exam in Quantum Physics. Wish me luck!",
    messages: [
      { id: 1, from: "them", text: "The group project presentation is at 5pm.", timestamp: "1:15 PM", reactions: [] },
      { id: 2, from: "me", text: "Got it! I'll finalize the slides by 4:30.", timestamp: "1:16 PM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Don't forget to check the API integration.", timestamp: "1:17 PM", reactions: [] },
      { id: 4, from: "me", text: "Integration check complete, looks solid.", timestamp: "1:20 PM", reactions: ["✅"], seen: true },
      { id: 5, from: "them", text: "Great work! See you in the meeting room.", timestamp: "1:21 PM", reactions: ["😎"] },
    ],
  },

  {
    id: 4,
    name: "Diana Prince",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "Active now",
    note: "🎨 Designing the new app interface, focusing on user accessibility first.",
    messages: [
      { id: 1, from: "them", text: "Game dev team is meeting at 3pm.", timestamp: "2:40 PM", reactions: [] },
      { id: 2, from: "me", text: "Cool, I'll bring the character designs 🎨", timestamp: "2:41 PM", reactions: [], seen: true },
      { id: 3, from: "them", text: "Perfect, see you then!", timestamp: "2:41 PM", reactions: [] },
      { id: 4, from: "them", text: "Can you also prep a quick summary of the accessibility changes?", timestamp: "2:45 PM", reactions: [] },
      { id: 5, from: "me", text: "Yep, summarized all WCAG compliance points.", timestamp: "2:46 PM", reactions: ["✨"], seen: true },
      { id: 6, from: "them", text: "That's exactly what we need, thanks!", timestamp: "2:47 PM", reactions: ["❤️"] },
    ],
  },

  {
    id: 5,
    name: "Eve Martinez",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    status: "Active 3m ago",
    note: "☕ Coffee Break",
    messages: [
      { id: 1, from: "them", text: "Found a critical bug in the matrix.", timestamp: "9:00 AM", reactions: [] },
      { id: 2, from: "me", text: "On it. Sending patches now.", timestamp: "9:01 AM", reactions: ["💻"], seen: true },
      { id: 3, from: "them", text: "Roger that.", timestamp: "9:02 AM", reactions: [] },
    ],
  },

  {
    id: 6,
    name: "Frank White",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg",
    status: "Active 10m ago",
    note: "🏃 At the gym",
    messages: [
      { id: 1, from: "them", text: "Client demo pushed to tomorrow.", timestamp: "12:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Got it. Need to finalize the report.", timestamp: "12:01 PM", reactions: ["✅"], seen: true },
      { id: 3, from: "them", text: "Good luck!", timestamp: "12:02 PM", reactions: [] },
      { id: 4, from: "me", text: "The final slide deck looks incredible, just reviewed it.", timestamp: "12:15 PM", reactions: [], seen: true },
    ],
  },

  {
    id: 7,
    name: "Grace Hall",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    status: "Active 4h ago",
    note: "🍔 Lunch!",
    messages: [
      { id: 1, from: "them", text: "Is the new logo ready for review?", timestamp: "1:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Yes, files sent via email 📤", timestamp: "1:01 PM", reactions: ["🎨"], seen: true },
      { id: 3, from: "them", text: "Looks great!", timestamp: "1:02 PM", reactions: [] },
      { id: 4, from: "me", text: "Which color scheme did you prefer?", timestamp: "1:05 PM", reactions: ["🤔"], seen: true },
      { id: 5, from: "them", text: "The one with the dark blue background.", timestamp: "1:06 PM", reactions: ["👍"] },
    ],
  },

  {
    id: 8,
    name: "Henry King",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
    status: "Active now",
    note: "😴 Taking a nap (jk, coding!)",
    messages: [
      { id: 1, from: "them", text: "Did you check the server logs?", timestamp: "3:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Checking now. Looks clean.", timestamp: "3:01 PM", reactions: ["👍"], seen: true },
      { id: 3, from: "them", text: "Perfect, thanks.", timestamp: "3:02 PM", reactions: [] },
    ],
  },

  {
    id: 9,
    name: "Ivy Chen",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    status: "Active 15m ago",
    note: "💡 Planning next sprint features.",
    messages: [
      { id: 1, from: "them", text: "Remember the meeting at 4 PM for sprint review.", timestamp: "3:30 PM", reactions: [] },
      { id: 2, from: "me", text: "Setting a reminder now.", timestamp: "3:31 PM", reactions: [], seen: true },
      { id: 3, from: "them", text: "Awesome! I'll prepare the final estimates.", timestamp: "3:35 PM", reactions: ["🙏"] },
    ],
  },

  {
    id: 10,
    name: "Jack Brown",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "Active 5s ago",
    note: "🚀 Deploying!",
    messages: [
      { id: 1, from: "them", text: "Deployment status?", timestamp: "3:40 PM", reactions: [] },
      { id: 2, from: "me", text: "Green! 🟢 Live in production.", timestamp: "3:41 PM", reactions: ["🎉"], seen: true },
      { id: 3, from: "them", text: "Celebration time!", timestamp: "3:42 PM", reactions: ["🔥"] },
    ],
  },

  {
    id: 11,
    name: "Kelly Green",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "Active 1h ago",
    note: "🎵 Listening to new album releases.",
    messages: [
      { id: 1, from: "them", text: "Did you receive the invoice?", timestamp: "9:30 AM", reactions: [] },
      { id: 2, from: "me", text: "Yes, processed it this morning.", timestamp: "9:31 AM", reactions: ["✅"], seen: true },
    ],
  },

  {
    id: 12,
    name: "Leo Torres",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Active 20m ago",
    note: "✈️ Next stop: Tokyo!",
    messages: [
      { id: 1, from: "me", text: "What time is the flight tomorrow?", timestamp: "10:00 AM", reactions: [] },
      { id: 2, from: "them", text: "Departure is at 7:00 AM.", timestamp: "10:01 AM", reactions: ["👍"] },
    ],
  },

  {
    id: 13,
    name: "Mia Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Active 5s ago",
    note: "📸 Photo shoot prep.",
    messages: [
      { id: 1, from: "them", text: "Need the final edits by noon.", timestamp: "11:30 AM", reactions: [] },
      { id: 2, from: "me", text: "On it!", timestamp: "11:31 AM", reactions: ["😎"], seen: true },
    ],
  },

  {
    id: 14,
    name: "Noah Davis",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "Active now",
    note: "🛠️ Fixing a tricky CSS bug.",
    messages: [
      { id: 1, from: "me", text: "Have you seen this weird layout issue?", timestamp: "1:00 PM", reactions: [] },
      { id: 2, from: "them", text: "Yes, it's a z-index problem. I'll take a look.", timestamp: "1:01 PM", reactions: ["💡"] },
    ],
  },

  {
    id: 15,
    name: "Olivia Chen",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    status: "Active 1d ago",
    note: "🧘 Meditation time.",
    messages: [
      { id: 1, from: "them", text: "Reminder: PTO starts Friday.", timestamp: "2:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Confirmed. Have a great time off!", timestamp: "2:01 PM", reactions: ["🎉"], seen: true },
    ],
  },

  {
    id: 16,
    name: "Peter Quinn",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    status: "Active 30m ago",
    note: "📈 Analyzing market data.",
    messages: [
      { id: 1, from: "them", text: "The Q3 reports are ready.", timestamp: "4:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Sending my analysis now.", timestamp: "4:01 PM", reactions: ["✅"], seen: true },
    ],
  },

  {
    id: 17,
    name: "Quincy Ross",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    status: "Active now",
    note: "🍕 Pizza night!",
    messages: [
      { id: 1, from: "me", text: "What kind of pizza do you want?", timestamp: "5:00 PM", reactions: [] },
      { id: 2, from: "them", text: "Pepperoni, please!", timestamp: "5:01 PM", reactions: ["👍"] },
    ],
  },

  {
    id: 18,
    name: "Ruby Stone",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    status: "Active 40m ago",
    note: "💻 Debugging a legacy system.",
    messages: [
      { id: 1, from: "them", text: "The server crashed again.", timestamp: "6:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Restoring from backup.", timestamp: "6:01 PM", reactions: ["🛠️"], seen: true },
    ],
  },

  {
    id: 19,
    name: "Sam Taylor",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    status: "Active 2h ago",
    note: "🏔️ Planning a hiking trip.",
    messages: [
      { id: 1, from: "me", text: "Did you book the trail permits?", timestamp: "7:00 PM", reactions: [] },
      { id: 2, from: "them", text: "Not yet, I'll do it tonight.", timestamp: "7:01 PM", reactions: ["🙏"] },
    ],
  },

  {
    id: 20,
    name: "Uma Vance",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    status: "Active now",
    note: "🥳 Birthday tomorrow!",
    messages: [
      { id: 1, from: "them", text: "See you at the party tomorrow!", timestamp: "8:00 PM", reactions: [] },
      { id: 2, from: "me", text: "Wouldn't miss it!", timestamp: "8:01 PM", reactions: ["🎉"], seen: true },
    ],
  },
];

export default initialChats;

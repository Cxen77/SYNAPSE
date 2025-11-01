import React, { useState, useEffect } from "react";
import { FaRegComment, FaShareAlt, FaEye, FaCog } from "react-icons/fa";

function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState({
    name: "John Doe",
    handle: "@john_synapse",
    avatar: "https://randomuser.me/api/portraits/men/50.jpg",
    banner: "linear-gradient(to right, #DBEAFE, #BFDBFE)",
    postsCount: 30,
    eventsAttended: 50,
    bio: "Passionate about innovation and hackathons. Building the future, one line of code at a time. #SynapseEvents",
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "John Doe",
      handle: "@john_synapse",
      time: "30 minutes ago",
      content:
        "Just wrapped up the 'CodeWave Hackathon 2024'! 🚀 What an incredible experience building a real-time collaborative coding environment. Huge shoutout to the organizers and my amazing team! #Hackathon #CodeWave #Innovation",
      likes: 163,
      views: "3.3K",
      shares: "14.7K",
      media: true,
    },
    {
      id: 2,
      author: "John Doe",
      handle: "@john_synapse",
      time: "2 hours ago",
      content:
        "Excited for the upcoming 'AI Summit'! Looking forward to connecting with fellow AI enthusiasts and learning about the latest breakthroughs. Who else is attending? #AISummit #TechEvents #MachineLearning",
      likes: 85,
      views: "2.1K",
      shares: "8.2K",
      media: false,
    },
    {
      id: 3,
      author: "John Doe",
      handle: "@john_synapse",
      time: "Yesterday",
      content:
        "My team's submission for the 'Future Innovations Challenge' is live! We developed a decentralized event ticketing system using blockchain. Check it out and let us know your thoughts! Link in bio. #Blockchain #DecentralizedApp #FutureTech",
      likes: 210,
      views: "5.5K",
      shares: "20.1K",
      media: true,
    },
  ]);

  const hotTopics = [
    { name: "Synapse Admin", handle: "@SynapseAdmin" },
    { name: "Synapse Events", handle: "@SynapseEvents" },
    { name: "Global Hackers", handle: "@GlobalHackers" },
  ];

  const trends = [
    { title: "#HackathonWinners", stats: "1.2M posts", type: "Popular" },
    { title: "#FutureInnovations", stats: "980K posts", type: "Trending" },
    { title: "#SynapseConnect", stats: "750K posts", type: "Community" },
    { title: "#EventTech", stats: "500K posts", type: "Popular" },
  ];

  return (
    <div className="bg-gray-50 h-screen w-full overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-6 flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 flex flex-col">
            
            {/* Profile Header */}
            <div className="relative flex-shrink-0">
              {/* Banner */}
              <div
                className="h-32 bg-gradient-to-r from-blue-50 to-blue-100"
                style={{ background: user.banner }}
              ></div>
              
              {/* Avatar and Info */}
              <div className="px-6 pb-4 -mt-16 relative z-10">
                <div className="flex items-start justify-between">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-sm ring-2 ring-gray-100"
                  />
                  <button className="mt-4 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm text-sm">
                    Edit Profile
                  </button>
                </div>
                
                <div className="mt-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-gray-600 text-sm">{user.handle}</p>
                  <p className="text-gray-700 text-sm mt-2">{user.bio}</p>
                  <div className="flex text-gray-600 text-sm gap-6 mt-2">
                    <span>
                      <span className="font-bold text-gray-900">{user.postsCount}</span> Posts
                    </span>
                    <span>
                      <span className="font-bold text-gray-900">{user.eventsAttended}</span> Events
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6 flex justify-around flex-shrink-0">
              {["posts", "replies", "media", "likes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 text-sm font-bold capitalize relative transition-colors duration-200 ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Posts Feed - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={user.avatar}
                      alt={post.author}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div>
                      <div>
                        <span className="font-bold text-gray-900">
                          {post.author}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {post.handle}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {post.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {post.content}
                  </p>
                  {post.media && (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4 flex items-center justify-center text-blue-400 text-lg font-semibold border border-blue-100">
                      Post Image / Media
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <div className="flex gap-6">
                      <button className="flex items-center gap-2 hover:text-blue-600 transition">
                        <FaRegComment size={18} /> {post.likes}
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-600 transition">
                        <FaEye size={18} /> {post.views}
                      </button>
                    </div>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition font-medium">
                      <FaShareAlt size={16} /> {post.shares}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Fixed, Not Scrollable */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            
            {/* Hot Topics */}
            <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 flex-shrink-0">
              <h3 className="text-base font-bold mb-3 text-gray-900">Hot Topics</h3>
              <div className="space-y-3">
                {hotTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img
                        src={`https://randomuser.me/api/portraits/${
                          index % 2 === 0 ? "women" : "men"
                        }/${20 + index}.jpg`}
                        alt={topic.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block truncate text-sm">
                          {topic.name}
                        </span>
                        <span className="text-gray-600 text-xs block truncate">
                          {topic.handle}
                        </span>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm flex-shrink-0 ml-2">
                      Read
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-blue-600 font-bold text-xs hover:underline">
                Show more →
              </button>
            </div>

            {/* Trends */}
            <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900">Trends for you</h3>
                <FaCog className="text-gray-500 cursor-pointer hover:text-blue-600 transition" size={16} />
              </div>
              <div className="space-y-3">
                {trends.map((trend, index) => (
                  <div key={index} className="hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer">
                    <span className="text-gray-500 text-xs block">
                      {index + 1}. {trend.type}
                    </span>
                    <p className="font-bold text-gray-900 mt-0.5 text-sm">{trend.title}</p>
                    <span className="text-gray-600 text-xs block mt-0.5">
                      {trend.stats}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-blue-600 font-bold text-xs hover:underline">
                Show more →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
import React, { useState, useEffect } from "react";
import { FaRegComment, FaShareAlt, FaEye } from "react-icons/fa"; // Using FaEye for views

function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState({
    name: "John Doe",
    handle: "@john_synapse",
    avatar: "https://randomuser.me/api/portraits/men/50.jpg",
    banner: "linear-gradient(to right, #60A5FA, #3B82F6)", // Tailwind blue gradients
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
      shares: "14.7K", // Using shares for the upward arrow icon
      media: true, // Indicates there's a media placeholder
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
    { title: "#AIRevolution", stats: "300K posts", type: "Trending" },
  ];

  return (
    // Outer container for the entire profile page, including padding for the navbar
    // The `flex justify-center` will center the content if it's not full width
    <div className="pt-8 pb-8 bg-gray-100 min-h-[calc(100vh-4rem)] flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {/* Main Content Area (Profile Header + Posts) */}
        <div className="col-span-1 md:col-span-2 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          {/* Profile Header */}
          <div className="relative">
            {/* Banner Area */}
            <div
              className="h-40 bg-blue-400"
              style={{ background: user.banner }}
            ></div>
            {/* Avatar and Info */}
            <div className="p-6 -mt-16 flex flex-col items-start relative z-10">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
              <h1 className="text-2xl font-bold mt-4 text-gray-900">
                {user.name}
              </h1>
              <p className="text-gray-500 text-sm">{user.handle}</p>
              <p className="text-gray-700 text-sm mt-2">{user.bio}</p>
              <div className="flex text-gray-600 text-sm gap-4 mt-2">
                <span>
                  <span className="font-semibold">{user.postsCount}</span> Posts
                </span>
                <span>
                  <span className="font-semibold">{user.eventsAttended}</span> Events
                </span>
              </div>
              <button className="absolute top-4 right-4 bg-white text-blue-600 border border-blue-600 px-5 py-2 rounded-full font-semibold hover:bg-blue-50 transition">
                Profile settings
              </button>
            </div>
          </div>

          {/* Tabs for Posts/Replies/Media/Likes */}
          <div className="border-b border-gray-200 mt-4 px-6 flex justify-around text-gray-600">
            {["posts", "replies", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-sm font-medium capitalize relative transition-colors duration-200 ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "hover:text-blue-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          <div className="p-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user.avatar} // Use current user's avatar for posts
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold text-gray-900">
                      {post.author}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {post.handle}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {post.time}
                    </span>
                  </div>
                </div>
                <p className="text-gray-800 mb-3 leading-relaxed">
                  {post.content}
                </p>
                {post.media && (
                  <div className="w-full h-48 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center text-blue-400 text-xl font-medium">
                    Post Image / Media
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <FaRegComment /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye /> {post.views} {/* Using FaEye for views */}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition">
                    <FaShareAlt /> {post.shares}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Hot topics */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Hot topics</h3>
            {hotTopics.map((topic, index) => (
              <div
                key={index}
                className="flex items-center justify-between mb-4 last:mb-0"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://randomuser.me/api/portraits/${
                      index % 2 === 0 ? "women" : "men"
                    }/${20 + index}.jpg`}
                    alt={topic.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {topic.name}
                    </span>
                    <span className="text-gray-500 text-sm block">
                      {topic.handle}
                    </span>
                  </div>
                </div>
                <button className="bg-white text-blue-600 border border-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition">
                  Read
                </button>
              </div>
            ))}
            <button className="mt-5 text-blue-600 font-semibold text-sm hover:underline">
              Show more...
            </button>
          </div>

          {/* Trends for you */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center justify-between">
              Trends for you
              <span className="text-blue-600 cursor-pointer text-base">⚙️</span> {/* Placeholder for settings icon */}
            </h3>
            {trends.map((trend, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <span className="text-gray-500 text-xs block">
                  {index + 1}. {trend.type}
                </span>
                <p className="font-semibold text-gray-800">{trend.title}</p>
                <span className="text-gray-500 text-xs block">
                  {trend.stats}
                </span>
              </div>
            ))}
            <button className="mt-5 text-blue-600 font-semibold text-sm hover:underline">
              Show more...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
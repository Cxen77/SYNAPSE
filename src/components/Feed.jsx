import React, { useState } from "react";
import FeedHeader from "./FeedHeader";
import PostCard from "./PostCard";

const initialPosts = [
  {
    id: 1,
    author: "Aarav Mehta",
    role: "Fullstack Student",
    time: "1h",
    text: "Looking for a teammate for our ML hackathon. Need 1 frontend + 1 ML engineer.",
    image: "",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Priya Sharma",
    role: "UI Designer",
    time: "3h",
    text: "Forming a 3-member team for product design sprint. DM if interested.",
    image: "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=1200&q=60&auto=format&fit=crop",
    likes: 34,
    comments: 5,
  },
];

export default function Feed() {
  const [posts, setPosts] = useState(initialPosts);
  const [feedType, setFeedType] = useState("For You");

  function handleCreatePost(newPost) {
    setPosts((p) => [{ id: Date.now(), ...newPost }, ...p]);
  }

  return (
    <main className="flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <FeedHeader
          feedType={feedType}
          setFeedType={setFeedType}
          onCreatePost={handleCreatePost}
        />

        {/* feed label */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <h3 className="text-lg font-semibold">{feedType} Feed</h3>
          <p className="text-sm text-gray-500">Showing posts recommended for you</p>
        </div>

        {/* posts */}
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </main>
  );
}

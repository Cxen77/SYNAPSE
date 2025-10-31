import React from "react";
import { FaRegThumbsUp, FaRegCommentDots, FaShare } from "react-icons/fa";

export default function PostCard({ post }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex gap-4">
        <img
          src={
            post.author === "You"
              ? "https://i.pravatar.cc/150?img=3"
              : "https://i.pravatar.cc/150?img=" + (post.id % 10 + 10)
          }
          alt="author"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h4 className="font-semibold">{post.author}</h4>
              <p className="text-xs text-gray-500">{post.role} • {post.time}</p>
            </div>
            <div className="text-sm text-gray-400">...</div>
          </div>

          <p className="mt-3 text-gray-700">{post.text}</p>

          {post.image && (
            <img src={post.image} alt="post" className="mt-3 rounded-lg max-h-80 w-full object-cover" />
          )}

          <div className="flex gap-6 mt-3 text-sm text-gray-600">
            <button className="flex items-center gap-2"><FaRegThumbsUp /> {post.likes}</button>
            <button className="flex items-center gap-2"><FaRegCommentDots /> {post.comments}</button>
            <button className="flex items-center gap-2"><FaShare /> Share</button>
          </div>
        </div>
      </div>
    </article>
  );
}

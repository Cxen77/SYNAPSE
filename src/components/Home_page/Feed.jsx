import React, { useState, useEffect } from "react";
import FeedHeader from "./FeedHeader";
import PostCard from "./PostCard";
import api from "../../api/axios";

export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedType, setFeedType] = useState("For You");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = React.useRef(null);

  // Reset when feed type changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setLoading(true); // Start loading immediately
    fetchPosts(1, feedType, true);
  }, [feedType]);

  // Fetch more when page changes (but not on initial reset which is handled above)
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, feedType, false);
    }
  }, [page]);

  const fetchPosts = async (pageNum, type, isRefresh) => {
    try {
      const filterParam = type === "Following" ? "following" : "";
      const { data } = await api.get(`/posts?pageNumber=${pageNum}&filter=${filterParam}`);

      const formattedPosts = data.posts.map(post => ({
        id: post._id,
        author: post.user.name,
        username: post.user.username, // Add username
        role: post.user.course ? `${post.user.course} Student` : "Member",
        time: new Date(post.createdAt).toLocaleDateString(),
        text: post.content,
        image: post.image,
        likes: post.likes.length,
        comments: post.comments,
        avatar: post.user.profilePic,
        userId: post.user._id // Add userId for ownership check
      }));

      setPosts(prev => isRefresh ? formattedPosts : [...prev, ...formattedPosts]);
      setHasMore(data.page < data.pages);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);

  function handleCreatePost(newPost) {
    const formattedPost = {
      id: newPost._id,
      author: newPost.user.name || user.name,
      role: newPost.user.course ? `${newPost.user.course} Student` : "Member",
      time: "Just now",
      text: newPost.content,
      image: newPost.image,
      likes: 0,
      comments: 0,
      avatar: newPost.user.profilePic || user.profilePic
    };
    setPosts((p) => [formattedPost, ...p]);
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      // toast.success("Post deleted successfully"); // Assuming toast is available
    } catch (err) {
      console.error("Failed to delete post", err);
      // toast.error("Failed to delete post");
    }
  };

  return (
    <main className="flex flex-col items-center w-full">
      <div className="w-full">
        <FeedHeader
          user={user}
          feedType={feedType}
          setFeedType={setFeedType}
          onCreatePost={handleCreatePost}
        />

        {/* feed label */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{feedType} Feed</h3>
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
            <p className="text-xs text-gray-500">Latest updates</p>
          </div>
        </div>

        {/* posts */}
        <div className="space-y-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUser={user} onDelete={handleDeletePost} />
          ))}

          {loading && (
            <div className="text-center py-4 text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {feedType === "Following" ? (
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {feedType === "Following" ? "No posts from friends yet" : "No posts yet"}
              </h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-6">
                {feedType === "Following"
                  ? "You aren't following anyone yet, or they haven't posted anything. Explore 'For You' to find people!"
                  : "Be the first to share something with the community!"}
              </p>
              {feedType === "Following" && (
                <button
                  onClick={() => setFeedType("For You")}
                  className="text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition"
                >
                  Switch to For You
                </button>
              )}
            </div>
          )}

          {/* Observer target for infinite scroll */}
          <div ref={observerTarget} className="h-4" />
        </div>
      </div>
    </main>
  );
}

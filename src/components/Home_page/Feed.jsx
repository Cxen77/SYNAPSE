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
        role: post.user.course ? `${post.user.course} Student` : "Member",
        time: new Date(post.createdAt).toLocaleDateString(),
        text: post.content,
        image: post.image,
        likes: post.likes.length,
        comments: post.comments,
        avatar: post.user.profilePic
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
        <div className="flex items-center justify-between mt-2 mb-4 px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{feedType} Feed</h3>
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
            <p className="text-xs text-gray-500">Latest updates</p>
          </div>
        </div>

        {/* posts */}
        <div className="space-y-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}

          {loading && (
            <div className="text-center py-4 text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              {feedType === "Following"
                ? "You aren't following anyone yet. Switch to 'For You' to find people!"
                : "No posts yet. Be the first to post!"}
            </div>
          )}

          {/* Observer target for infinite scroll */}
          <div ref={observerTarget} className="h-4" />
        </div>
      </div>
    </main>
  );
}

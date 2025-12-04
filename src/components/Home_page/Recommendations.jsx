import React, { useState, useEffect } from "react";
import { HiUserAdd } from "react-icons/hi";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Avatar from "../common/Avatar";

const feeds = [
  { name: "Adobe Illustrator", type: "Graphic Design", followers: "242k followers" },
  { name: "Figma", type: "Design Services", followers: "102k followers" },
  { name: "Webflow", type: "Software Development", followers: "20k followers" },
];

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await api.get('/users/recommended');
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <aside className="bg-white rounded-xl shadow-sm sticky top-[72px] self-start border border-gray-200 max-h-[calc(100vh-72px)] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="p-5 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50 to-white">
        <h3 className="font-bold text-gray-900">Recommendations</h3>
        {/* Tabs */}
        <div className="flex gap-4 text-sm mt-3">
          <button className="pb-2 text-blue-600 border-b-2 border-blue-600 font-semibold -mb-[1px]">People</button>
          <button className="pb-2 text-gray-500 hover:text-gray-800 font-medium transition">Groups</button>
          <button className="pb-2 text-gray-500 hover:text-gray-800 font-medium transition">Pages</button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* People you might know */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">People you might know</p>
            <button className="text-xs text-blue-600 hover:underline font-semibold">See all</button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((p) => (
                <div key={p._id} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Link to={`/profile/${p.username}`}>
                      <Avatar
                        src={p.profilePic}
                        alt={p.name}
                        size="custom"
                        className="w-10 h-10 ring-2 ring-gray-50 flex-shrink-0 hover:opacity-90 transition"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/profile/${p.username}`}>
                        <div className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{p.name}</div>
                      </Link>
                      <div className="text-xs text-gray-500 truncate">
                        {p.skills && p.skills.length > 0 ? p.skills[0].name || p.skills[0] : 'Student'}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">Suggested for you</div>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition flex-shrink-0">
                    <HiUserAdd size={16} />
                  </button>
                </div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No recommendations yet.</p>
              )}
            </div>
          )}
        </div>

        <hr className="my-4 border-gray-100" />

        {/* Recommended Pages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recommended Pages</p>
            <button className="text-xs text-blue-600 hover:underline font-semibold">See all</button>
          </div>
          <div className="space-y-4">
            {feeds.map((feed, i) => (
              <div key={i} className="flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0 shadow-sm border border-blue-100">
                    {feed.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{feed.name}</div>
                    <div className="text-xs text-gray-500 truncate">{feed.type}</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition flex-shrink-0">
                  <HiUserAdd size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
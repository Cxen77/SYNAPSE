import React from "react";

const people = [
  { name: "Jerome Bell", title: "Interaction Designer", mutuals: 12 },
  { name: "Cody Fisher", title: "Interaction Designer", mutuals: 8 },
  { name: "Cameron Williamson", title: "Product Designer", mutuals: 5 },
];

const nyu_people = [
  { name: "Theresa Webb", title: "Interaction Designer", mutuals: 7 },
  { name: "Jacob Jones", title: "Interaction Designer", mutuals: 4 },
  { name: "Floyd Miles", title: "Interaction Designer", mutuals: 9 },
];

const feeds = [
  { name: "Adobe Illustrator", type: "Graphic Design", followers: "242 connections follow this page" },
  { name: "Figma", type: "Design Services", followers: "102 connections follow this page" },
  { name: "Webflow", type: "Software Development", followers: "20 connections follow this page" },
];

export default function Recommendations() {
  return (
    <aside className="bg-white rounded-xl shadow-sm sticky top-28 self-start border border-gray-200 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="p-5 border-b border-gray-200 flex-shrink-0">
        {/* Tabs */}
        <div className="flex gap-4 text-sm border-b border-gray-200 pb-2">
          <button className="pb-2 text-blue-600 border-b-2 border-blue-600 font-semibold -mb-2">Network</button>
          <button className="pb-2 text-gray-600 hover:text-blue-600 font-medium -mb-2">Team</button>
          <button className="pb-2 text-gray-600 hover:text-blue-600 font-medium -mb-2">Groups</button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Based on Your Recent Activity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">Based on Your Recent Activity</p>
            <button className="text-xs text-blue-600 hover:underline font-semibold">See more</button>
          </div>
          <div className="space-y-3">
            {people.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-600 truncate">{p.title}</div>
                    <div className="text-xs text-gray-500 truncate">{p.mutuals} mutuals</div>
                  </div>
                </div>
                <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition shadow-sm flex-shrink-0 font-bold text-lg">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* People you may know from NYU */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">People you may know from NYU</p>
            <button className="text-xs text-blue-600 hover:underline font-semibold">See more</button>
          </div>
          <div className="space-y-3">
            {nyu_people.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    src={`https://i.pravatar.cc/100?img=${i + 20}`} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-600 truncate">{p.title}</div>
                    <div className="text-xs text-gray-500 truncate">{p.mutuals} mutuals</div>
                  </div>
                </div>
                <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition shadow-sm flex-shrink-0 font-bold text-lg">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Add to your feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">Add to your feed</p>
            <button className="text-xs text-blue-600 hover:underline font-semibold">See more</button>
          </div>
          <div className="space-y-3">
            {feeds.map((feed, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                    {feed.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">{feed.name}</div>
                    <div className="text-xs text-gray-600 truncate">{feed.type}</div>
                    <div className="text-xs text-gray-500 truncate">{feed.followers}</div>
                  </div>
                </div>
                <button className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition shadow-sm flex-shrink-0 font-bold text-lg">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
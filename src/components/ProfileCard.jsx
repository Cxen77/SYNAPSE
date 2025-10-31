import React from "react";

export default function ProfileCard() {
  return (
    <aside className="bg-white rounded-2xl shadow-sm p-6 sticky top-28 self-start">
      {/* Header image */}
      <div className="h-20 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300 mb-4 overflow-hidden" />

      {/* profile */}
      <div className="flex flex-col items-center -mt-12">
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="profile"
          className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover"
        />
        <h3 className="mt-3 text-lg font-semibold">Cxen</h3>
        <p className="text-sm text-gray-500">Computer Science Student</p>
      </div>

      {/* stats / nav */}
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Profile views</span>
          <span className="font-medium text-gray-800">122</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Post impressions</span>
          <span className="font-medium text-gray-800">17,826</span>
        </div>

        <hr className="my-4" />

        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-3 text-gray-700">
            <span className="w-3 h-3 rounded-full bg-blue-200 inline-block" />
            My Network
          </li>
          <li className="flex items-center gap-3 text-gray-700">
            <span className="w-3 h-3 rounded-full bg-green-200 inline-block" />
            Groups
          </li>
          <li className="flex items-center gap-3 text-gray-700">Saved</li>
          <li className="flex items-center gap-3 text-gray-700">Events</li>
        </ul>

        <button className="mt-4 w-full bg-white border border-gray-200 text-sm rounded-lg py-2 hover:bg-gray-50">
          Try Premium for FREE
        </button>
      </div>
    </aside>
  );
}

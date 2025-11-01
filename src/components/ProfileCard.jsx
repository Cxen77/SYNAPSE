import React from "react";

export default function ProfileCard() {
  return (
    <aside className="bg-white rounded-xl shadow-sm p-5 sticky top-28 self-start border border-gray-200">
      {/* Header image */}
      <div className="h-20 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 mb-4 overflow-hidden" />

      {/* profile */}
      <div className="flex flex-col items-center -mt-14">
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="profile"
          className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover ring-2 ring-gray-100"
        />
        <h3 className="mt-3 text-lg font-bold text-gray-900">Cxen</h3>
        <p className="text-sm text-gray-600">Computer Science Student</p>
      </div>

      {/* stats / nav */}
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer">
          <span>Profile views</span>
          <span className="font-bold text-blue-600">122</span>
        </div>
        <div className="flex justify-between text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer">
          <span>Post impressions</span>
          <span className="font-bold text-blue-600">17,826</span>
        </div>

        <hr className="my-4 border-gray-200" />

        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="font-medium">My Network</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="font-medium">Groups</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer">
            <span className="font-medium">Saved</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 hover:bg-blue-50 p-2 rounded-lg transition cursor-pointer">
            <span className="font-medium">Events</span>
          </li>
        </ul>

        <button className="mt-4 w-full bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 text-sm rounded-lg py-2.5 hover:from-blue-100 hover:to-purple-100 transition font-bold text-blue-900">
          Try Premium for FREE
        </button>
      </div>
    </aside>
  );
}
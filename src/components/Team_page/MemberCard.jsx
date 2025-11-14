import React from "react";

function MemberCard({ member }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100">
      <img 
        src={member.img} 
        alt={member.name} 
        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" 
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 truncate">{member.name}</h3>
        <p className="text-sm text-gray-600 truncate">{member.skill}</p>
      </div>
      <button className="text-xs text-gray-400 hover:text-red-600 transition font-medium px-2 py-1 hover:bg-red-50 rounded">
        Remove
      </button>
    </div>
  );
}

export default MemberCard;

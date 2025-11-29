import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import Avatar from "../common/Avatar";

function PendingInvites({ invites, onAccept, onDecline }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-orange-50 to-white border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Pending Invites</h3>
        <p className="text-sm text-gray-600 mt-1">{invites.length} waiting for response</p>
      </div>

      <div className="p-4 space-y-4">
        {invites.map((invite, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                src={invite.img}
                alt={invite.name}
                size="custom"
                className="w-14 h-14 ring-2 ring-white"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{invite.name}</h3>
                <p className="text-sm text-gray-600 truncate">{invite.skill}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAccept(invite.id)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <FaCheck /> Accept
              </button>
              <button
                onClick={() => onDecline(invite.id)}
                className="bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition text-sm font-bold flex items-center justify-center gap-2 border border-gray-300"
              >
                <FaTimes /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PendingInvites;

import React from 'react';
import { BsSignDeadEndFill } from 'react-icons/bs';
import { FaBackwardFast, FaRegFaceGrinHearts } from 'react-icons/fa6';
import { PiDropHalfBottomBold } from 'react-icons/pi';

const Cards = ({ eventData }) => {
  const {
    organizerName,
    organizerTitle,
    organizerAvatar,
    eventImageUrl,
    eventName,
    eventPrize,
    eventDescription,
  } = eventData;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden my-4 mx-4 sm:mx-auto max-w-sm border border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img className="w-10 h-10 rounded-full ring-2 ring-gray-100" src={organizerAvatar} alt="" />
          <div>
            <p className="font-semibold text-gray-900">{organizerName}</p>
            <p className="text-xs text-gray-500">{organizerTitle}</p>
          </div>
        </div>
      </div>

      <img className="h-48 w-full object-cover rounded-none" src={eventImageUrl} alt={eventName} />

      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900">{eventName}</h2>
        <p className="text-md mb-3 text-gray-700">{eventPrize}</p>
        <p className="text-sm text-gray-600 mb-5">{eventDescription}</p>

        <div className="flex justify-end space-x-3">
          <button className="px-6 py-2 text-sm border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition">View</button>
          <button className="px-6 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm">Join</button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
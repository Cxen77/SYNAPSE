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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden my-4 mx-4 sm:mx-auto max-w-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img className="w-10 h-10 rounded-full" src={organizerAvatar} alt="" />
          <div>
            <p className="font-semibold">{organizerName}</p>
            <p className="text-xs text-gray-500">{organizerTitle}</p>
          </div>
        </div>
      </div>

      <img className="h-48 w-full object-cover rounded-none" src={eventImageUrl} alt={eventName} />

      <div className="p-4">
        <h2 className="text-lg font-bold">{eventName}</h2>
        <p className="text-md mb-3">{eventPrize}</p>
        <p className="text-sm text-gray-600 mb-5">{eventDescription}</p>

        <div className="flex justify-end space-x-3">
          <button className="px-6 py-2 text-sm border rounded-full">View</button>
          <button className="px-6 py-2 text-sm bg-purple-600 text-white rounded-full">Join</button>
        </div>
      </div>
    </div>
  );
};

export default Cards;

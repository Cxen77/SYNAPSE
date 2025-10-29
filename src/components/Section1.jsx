import React from "react";

   const Section1 = () => {
  return (
    <div className="h-screen w-full bg-red-300 flex items-center justify-center">
      <div className="h-[620px] w-full md:w-1/5 bg-gray-100 rounded-lg mr-[1185px] mb-[80px] flex flex-col items-center pt-6">
        
        {/* Profile Image */}
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
        />

        {/* Username + Role directly below */}
        <div className="mt-3 text-center">
          <h2 className="text-xl font-semibold text-gray-800">cxen</h2>
          <p className="text-gray-600 text-sm">Computer Science Student</p>
        </div>

      </div>
    </div>
  );
};

export default Section1;


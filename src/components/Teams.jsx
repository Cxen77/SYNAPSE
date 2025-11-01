import React from "react";
import { FaUsers, FaUserPlus, FaSearch, FaCheck, FaTimes, FaCog } from "react-icons/fa";

function CircularProgress({ percentage, color }) {
  const emptyColor = "#e5e7eb";
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: `conic-gradient(${color} ${percentage}%, ${emptyColor} 0)`,
      }}
    >
      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
        <span className="font-bold text-sm" style={{ color: color }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function Teams() {
  const userTeams = [
    {
      id: 1,
      teamName: "CodeWave",
      type: "Hackathon Team",
      project: "Real-time Collab Editor",
      members: [
        {
          name: "Jacob Jones",
          skill: "Web Designer",
          img: "https://randomuser.me/api/portraits/men/62.jpg",
        },
        {
          name: "Ronald Richards",
          skill: "Marketing Coordinator",
          img: "https://randomuser.me/api/portraits/men/63.jpg",
        },
        {
          name: "Theresa Webb",
          skill: "Team Leader",
          img: "https://randomuser.me/api/portraits/women/62.jpg",
        },
        {
          name: "Arlene McCoy",
          skill: "Scrum Master",
          img: "https://randomuser.me/api/portraits/women/63.jpg",
        },
      ],
    },
    {
      id: 2,
      teamName: "Synapse",
      type: "Project Team",
      project: "Student Collaboration Platform",
      members: [
        {
          name: "Theresa Webb",
          skill: "Team Leader",
          img: "https://randomuser.me/api/portraits/women/62.jpg",
        },
        {
          name: "Alferd",
          skill: "UI/UX 2nd year",
          img: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        {
          name: "Edison",
          skill: "Backend developer 3rd year",
          img: "https://randomuser.me/api/portraits/men/34.jpg",
        },
      ],
    },
  ];

  const pendingInvites = [
    { name: "Devon Lane", skill: "Backend Developer", img: "https://randomuser.me/api/portraits/men/50.jpg" },
    { name: "Jane Cooper", skill: "UI/UX Specialist", img: "https://randomuser.me/api/portraits/women/50.jpg" },
  ];

  const recommendedTeammates = [
    {
      name: "Alferd",
      skill: "UI/UX 2nd year",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      match: 10,
      color: "#a855f7",
    },
    {
      name: "Jasper",
      skill: "Frontend Developer 1st year",
      img: "https://randomuser.me/api/portraits/men/33.jpg",
      match: 90,
      color: "#ec4899",
    },
    {
      name: "Edison",
      skill: "Backend developer 3rd year",
      img: "https://randomuser.me/api/portraits/men/34.jpg",
      match: 50,
      color: "#d1d5db",
    },
    {
      name: "Alex",
      skill: "AI/ML Developer 2nd year",
      img: "https://randomuser.me/api/portraits/women/32.jpg",
      match: 75,
      color: "#22c55e",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen w-full">

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search for new members or teams..."
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
            />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content - Teams */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Quick Actions at Top */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition border-2 border-blue-100 hover:border-blue-300 group">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                  <FaUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900">Find Members</h4>
                  <p className="text-sm text-gray-600">Search for new talent</p>
                </div>
              </button>
              <button className="flex items-center gap-4 p-5 bg-white rounded-xl hover:shadow-md transition border-2 border-blue-100 hover:border-blue-300 group">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                  <FaUserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900">Create Team</h4>
                  <p className="text-sm text-gray-600">Start a new project</p>
                </div>
              </button>
            </div>

            {/* Team Cards */}
            {userTeams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                
                {/* Team Header */}
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{team.teamName}</h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {team.type}
                        </span>
                      </div>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {team.project}
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200">
                      <FaCog /> Manage
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {team.members.length} members
                  </div>
                </div>

                {/* Team Members Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {team.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100">
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
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:-mt-20 flex flex-col">
            
            {/* Pending Invites */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-orange-50 to-white border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Pending Invites</h3>
                <p className="text-sm text-gray-600 mt-1">{pendingInvites.length} waiting for response</p>
              </div>
              <div className="p-4 space-y-4">
                {pendingInvites.map((invite, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={invite.img} 
                        alt={invite.name} 
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-white" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{invite.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{invite.skill}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
                        <FaCheck /> Accept
                      </button>
                      <button className="bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition text-sm font-bold flex items-center justify-center gap-2 border border-gray-300">
                        <FaTimes /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Teammates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
              <div className="p-5 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Recommended</h3>
                <p className="text-sm text-gray-600 mt-1">Based on your skills</p>
              </div>
              <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                {recommendedTeammates.map((person, index) => (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition cursor-pointer">
                    <img 
                      src={person.img} 
                      alt={person.name} 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{person.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{person.skill}</p>
                    </div>
                    <CircularProgress percentage={person.match} color={person.color} />
                  </div>
                ))}
              </div>
              <div className="p-4 text-center border-t border-gray-200">
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  View All Recommendations →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Teams;
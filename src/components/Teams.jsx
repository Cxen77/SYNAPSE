import React from "react";
import { FaUsers, FaUserPlus, FaSearch, FaCheck, FaTimes, FaCog } from "react-icons/fa"; // Added FaCog

// Helper component for the percentage rings (unchanged)
function CircularProgress({ percentage, color }) {
  const emptyColor = "#e5e7eb"; // gray-200
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(${color} ${percentage}%, ${emptyColor} 0)`,
      }}
    >
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
        <span className="font-semibold text-sm" style={{ color: color }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function Teams() {

  // --- MODIFIED --- Data is now categorized into different teams
  const userTeams = [
    {
      id: 1,
      teamName: "Hackathon Team: 'CodeWave'",
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
      teamName: "Project Team: 'Synapse'",
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
      color: "#a855f7", // Purple
    },
    {
      name: "Jasper",
      skill: "Frontend Developer 1st year",
      img: "https://randomuser.me/api/portraits/men/33.jpg",
      match: 90,
      color: "#ec4899", // Pink
    },
    {
      name: "Edison",
      skill: "Backend developer 3rd year",
      img: "https://randomuser.me/api/portraits/men/34.jpg",
      match: 50,
      color: "#d1d5db", // Gray
    },
    {
      name: "Alex",
      skill: "AI/ML Developer 2nd year",
      img: "https://randomuser.me/api/portraits/women/32.jpg",
      match: 75,
      color: "#22c55e", // Green
    },
  ];

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-4rem)] w-full overflow-y-auto p-8">
      
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch size={20} />
          </span>
          <input
            type="text"
            placeholder="Search for new members or teams..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ============================= */}
        {/* Main Column (Categorized Teams) */}
        {/* ============================= */}
        {/* --- MODIFIED --- This column now holds all the team cards */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Map over the user's teams */}
          {userTeams.map((team) => (
            <div key={team.id} className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {team.teamName}
                  </h2>
                  <p className="text-sm text-gray-500">{team.project}</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition">
                  <FaCog /> Manage Team
                </button>
              </div>

              {/* Team Member List */}
              <div className="divide-y divide-gray-200">
                {team.members.map((member, index) => (
                  <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <img src={member.img} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.skill}</p>
                      </div>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-red-600 transition">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* ======================= */}
        {/* Right Sidebar (Actions) */}
        {/* ======================= */}
        <div className="md:col-span-1 flex flex-col gap-8">
          
          {/* Quick Actions Card */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h3>
            <div className="flex flex-col gap-4">
              <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-blue-200">
                <FaUsers className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-left text-blue-800">Find Member</h4>
                  <p className="text-sm text-left text-blue-700">Search for new talent.</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition border border-blue-200">
                <FaUserPlus className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-left text-blue-800">Create New Team</h4>
                  <p className="text-sm text-left text-blue-700">Start a new project or team.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Pending Invites Card */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Pending Invites</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingInvites.map((invite, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={invite.img} alt={invite.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{invite.name}</h3>
                      <p className="text-sm text-gray-600">{invite.skill}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-1.5">
                      <FaCheck /> Accept
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium flex items-center justify-center gap-1.5">
                      <FaTimes /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Teammates Card */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recommended Teammates</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recommendedTeammates.map((person, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <img src={person.img} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{person.name}</h3>
                      <p className="text-sm text-gray-600">{person.skill}</p>
                    </div>
                  </div>
                  <CircularProgress percentage={person.match} color={person.color} />
                </div>
              ))}
            </div>
            <div className="p-4 text-center">
              <button className="text-sm font-medium text-blue-600 hover:underline">
                Show more
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Teams;
import React from "react";
import SearchBar from "./SearchBar";
import QuickActions from "./QuickActions";
import TeamCard from "./TeamCard";
import PendingInvites from "./PendingInvites";
import Recommended from "./Recommended";

function Teams() {
  const userTeams = [...];          // your previous data
  const pendingInvites = [...];     
  const recommendedTeammates = [...];

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <SearchBar />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Section */}
          <div className="lg:col-span-8 space-y-6">
            <QuickActions />

            {userTeams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>

          {/* Right Section */}
          <div className="lg:col-span-4 space-y-6 lg:-mt-20 flex flex-col">
            <PendingInvites invites={pendingInvites} />
            <Recommended people={recommendedTeammates} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Teams;

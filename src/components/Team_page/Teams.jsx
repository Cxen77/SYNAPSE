import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import QuickActions from "./QuickActions";
import TeamCard from "./TeamCard";
import PendingInvites from "./PendingInvites";
import Recommended from "./Recommended";
import CreateTeamModal from "./CreateTeamModal";
import FindMembersModal from "./FindMembersModal";
import api from "../../api/axios";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [invites, setInvites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFindMembersOpen, setIsFindMembersOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, invitesRes, recsRes] = await Promise.all([
        api.get("/teams"),
        api.get("/teams/invites"),
        api.get("/users/recommended")
      ]);

      // Format Teams
      const formattedTeams = teamsRes.data.map(team => ({
        id: team._id,
        teamName: team.name,
        type: team.visibility.charAt(0).toUpperCase() + team.visibility.slice(1),
        project: team.category,
        description: team.description,
        members: team.members.map(m => ({
          name: m.name,
          role: "Member",
          avatar: m.profilePic
        }))
      }));
      setTeams(formattedTeams);

      // Format Invites
      const formattedInvites = invitesRes.data.map(team => ({
        id: team._id, // Team ID
        name: team.name, // Team Name
        skill: team.category, // Using category as "skill" or context
        img: team.leader?.profilePic // Showing leader's pic as the invite image
      }));
      setInvites(formattedInvites);

      // Format Recommendations
      const formattedRecs = recsRes.data.map(user => ({
        id: user._id,
        name: user.name,
        username: user.username, // Add username
        skill: user.skills?.[0] || "Developer", // Fallback skill
        img: user.profilePic,
        match: Math.floor(Math.random() * 20) + 80, // Fake match % for now
        color: "#3b82f6"
      }));
      setRecommendations(formattedRecs);

    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = () => {
    fetchData();
  };

  const handleAcceptInvite = async (teamId) => {
    try {
      await api.put(`/teams/${teamId}/accept`);
      fetchData(); // Refresh all data
    } catch (err) {
      console.error("Failed to accept invite", err);
    }
  };

  const handleDeclineInvite = async (teamId) => {
    try {
      await api.put(`/teams/${teamId}/decline`);
      fetchData(); // Refresh all data
    } catch (err) {
      console.error("Failed to decline invite", err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <SearchBar />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Section */}
          <div className="lg:col-span-8 space-y-6">
            <QuickActions
              onCreateClick={() => setIsCreateModalOpen(true)}
              onFindMembersClick={() => setIsFindMembersOpen(true)}
            />

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
                <p className="text-lg font-semibold">No teams yet</p>
                <p className="text-sm">Create a team to get started!</p>
              </div>
            ) : (
              teams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))
            )}
          </div>

          {/* Right Section */}
          <div className="lg:col-span-4 space-y-6 lg:-mt-20 flex flex-col">
            {invites.length > 0 && (
              <PendingInvites
                invites={invites}
                onAccept={handleAcceptInvite}
                onDecline={handleDeclineInvite}
              />
            )}
            <Recommended people={recommendations} />
          </div>

        </div>
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
      />

      <FindMembersModal
        isOpen={isFindMembersOpen}
        onClose={() => setIsFindMembersOpen(false)}
      />
    </div>
  );
}

export default Teams;
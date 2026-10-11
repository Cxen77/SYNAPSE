import React, { useState, useEffect } from "react";
import { FaExternalLinkAlt, FaCheckCircle, FaHourglassHalf, FaUsers, FaChevronDown, FaChevronUp, FaSignOutAlt, FaRocket } from "react-icons/fa";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { useSocket } from "../../../context/SocketContext";

export default function TempTeamBanner({ chat, currentUser, onSquadConfirmed }) {
  const teamId = chat?.tempTeamId || chat?.teamId;
  const { socket } = useSocket();

  const [loading, setLoading] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch status of the prospective temp team
  const fetchStatus = async () => {
    if (!teamId) return;
    try {
      const { data } = await api.get(`/teams/${teamId}/temp-status`);
      setTeamStatus(data);
    } catch (err) {
      console.warn("Could not load temp team status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [teamId]);

  // Listen to real-time team updates
  useEffect(() => {
    if (!socket || !chat?._id) return;

    const handleTempTeamUpdated = (updateData) => {
      if (updateData?.teamId?.toString() === teamId?.toString()) {
        fetchStatus();
      }
    };

    socket.on("tempTeam:updated", handleTempTeamUpdated);
    return () => {
      socket.off("tempTeam:updated", handleTempTeamUpdated);
    };
  }, [socket, chat?._id, teamId]);

  if (!chat?.isTempTeamChat && !teamStatus?.isTemp && teamStatus?.tempStatus !== "confirmed") {
    // Not a temp squad or prospective squad chat
    return null;
  }

  const currentUserId = currentUser?._id || currentUser?.uid;
  const confirmations = teamStatus?.confirmations || [];
  const members = teamStatus?.members || chat?.participants || [];
  const isConfirmedByUser = confirmations.some(
    (c) => (c.userId?._id || c.userId)?.toString() === currentUserId?.toString()
  );

  const totalMembers = members.length;
  const confirmedCount = confirmations.length;
  const isAllConfirmed = teamStatus?.tempStatus === "confirmed" || (totalMembers > 0 && confirmedCount >= totalMembers);

  const handleConfirm = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/teams/${teamId}/temp-confirm`);
      toast.success(data.message || "Squad confirmed!");
      await fetchStatus();
      if (onSquadConfirmed) onSquadConfirmed();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to confirm squad");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!teamId) return;
    if (!window.confirm("Are you sure you want to leave this prospective squad?")) return;
    setLoading(true);
    try {
      await api.post(`/teams/${teamId}/temp-leave`);
      toast.success("Left the prospective squad");
      window.location.href = "/events";
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to leave squad");
      setLoading(false);
    }
  };

  const eventData = teamStatus?.event;
  const externalUrl = eventData?.externalUrl || chat?.externalEventUrl;
  const platform = eventData?.platform || "External";

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white border-b border-indigo-700/50 shadow-md">
      {/* Top Bar / Compact View */}
      <div className="px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isAllConfirmed
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
          }`}>
            {isAllConfirmed ? "Official Squad Formed" : "Prospective Squad"}
          </span>

          <span className="text-sm font-semibold truncate text-white">
            {eventData?.title ? eventData.title : "External Competition Squad"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all hover:scale-105"
            >
              <span>{platform} Event</span>
              <FaExternalLinkAlt className="text-[10px]" />
            </a>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isExpanded ? "Collapse banner" : "Expand banner"}
          >
            {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Squad Decision Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-6 pt-1 border-t border-indigo-800/40 text-xs sm:text-sm">
          {/* Explanation note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
            <p className="text-indigo-200 leading-relaxed text-xs">
              {isAllConfirmed ? (
                <span className="text-emerald-300 font-medium">
                  🎉 All members confirmed! Coordinate your team lead to officially submit your team on {platform}.
                </span>
              ) : (
                <span>
                  💡 <strong>How it works:</strong> Chat with your auto-matched squad, discuss tech stack & roles, and click <strong>"Confirm Squad"</strong> once you agree to compete together on {platform}.
                </span>
              )}
            </p>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-white bg-indigo-500/30 px-2 py-1 rounded-md">
                {confirmedCount} / {totalMembers || 0} Confirmed
              </span>
            </div>
          </div>

          {/* Members Readiness Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {members.map((member) => {
              const mId = member._id?.toString() || member.toString();
              const isConfirmed = confirmations.some(
                (c) => (c.userId?._id || c.userId)?.toString() === mId
              );
              const isMe = mId === currentUserId?.toString();

              return (
                <div
                  key={mId}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    isConfirmed
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={member.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "Member")}`}
                      alt={member.name || "Member"}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-white truncate block">
                        {member.name || "Squad Member"} {isMe && "(You)"}
                      </span>
                    </div>
                  </div>

                  {isConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                      <FaCheckCircle className="text-[10px]" /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <FaHourglassHalf className="text-[10px]" /> Deciding
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-indigo-800/40">
            <div className="flex items-center gap-2">
              {!isAllConfirmed ? (
                isConfirmedByUser ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/30 text-emerald-300 rounded-xl font-bold border border-emerald-500/40 text-xs sm:text-sm">
                    <FaCheckCircle /> You are Confirmed (Waiting for teammates)
                  </div>
                ) : (
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <FaRocket /> Confirm Squad (I'm Ready)
                  </button>
                )
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-extrabold rounded-xl shadow-md text-xs sm:text-sm">
                  <FaCheckCircle /> Official Squad Active
                </div>
              )}

              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex sm:hidden items-center gap-1 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20"
                >
                  <span>{platform}</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </a>
              )}
            </div>

            {!isAllConfirmed && (
              <button
                onClick={handleLeave}
                disabled={loading}
                className="text-xs text-rose-300 hover:text-rose-100 hover:underline flex items-center gap-1.5 py-1 px-2 transition-colors disabled:opacity-50"
              >
                <FaSignOutAlt /> Leave Squad
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

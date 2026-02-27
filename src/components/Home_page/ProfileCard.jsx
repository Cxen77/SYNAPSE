import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, CalendarDays, PlusCircle, ClipboardList, Search } from "lucide-react";
import { FaGraduationCap } from "react-icons/fa";
import Avatar from "../common/Avatar";

// ── helpers ─────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-24 bg-gray-200" />
        <div className="px-5 pb-5 -mt-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white" />
          <div className="mt-3 h-5 w-32 bg-gray-200 rounded" />
          <div className="mt-2 h-4 w-24 bg-gray-200 rounded" />
          <div className="mt-4 w-full h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 rounded-lg" />)}
      </div>
    </div>
  );
}

// Compute a simple profile-completion percentage
function profileCompletion(user) {
  const fields = [
    user.name, user.bio, user.college, user.course,
    user.year, user.section, user.skills?.length, user.profilePic,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ── Main Component ───────────────────────────────
export default function ProfileCard({ user, loading }) {
  const navigate = useNavigate();

  if (loading) return <SkeletonCard />;

  if (!user) {
    return (
      <aside className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
          <Users className="text-gray-400 w-7 h-7" />
        </div>
        <h3 className="font-bold text-gray-900">Welcome!</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">Sign in to see your profile</p>
        <Link to="/login" className="block w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition text-center">
          Sign In
        </Link>
      </aside>
    );
  }

  const banner = user.bannerPic || user.coverImage;
  const subtitle = user.course ? `${user.course} Student` : "Student";
  const completion = profileCompletion(user);

  const quickActions = [
    { icon: <Search size={18} />, label: "Find Teammates", to: "/teams" },
    { icon: <CalendarDays size={18} />, label: "Browse Events", to: "/events" },
    { icon: <PlusCircle size={18} />, label: "Create Event", to: "/events" },
    { icon: <ClipboardList size={18} />, label: "My Registrations", to: "/events" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Identity + Academic Card ── */}
      <aside className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gray-900 relative">
          {banner ? (
            <>
              <img src={banner} alt="cover" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob" />
              <div className="absolute -bottom-8 left-0 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" />
            </>
          )}
          {/* Avatar anchored to bottom of banner */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <Link to="/profile">
              <Avatar
                src={user.profilePic}
                alt={user.name}
                size="custom"
                className="w-20 h-20 border-4 border-white shadow-md bg-white hover:opacity-90 transition object-cover"
              />
            </Link>
          </div>
        </div>

        <div className="px-5 pb-5 pt-12">
          {/* Name + subtitle */}
          <div className="flex flex-col items-center mb-3">
            <Link to="/profile" className="text-base font-bold text-gray-900 hover:text-blue-600 transition text-center">
              {user.name}
            </Link>
            <p className="text-sm text-blue-600 font-semibold">{subtitle}</p>
            {user.college && (
              <p className="text-xs text-gray-500 text-center mt-0.5 truncate max-w-full px-2">{user.college}</p>
            )}
          </div>

          {/* Profile completion */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 font-medium mb-1.5">
              <span>Profile Completion</span>
              <span className="text-blue-600 font-bold">{completion}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Academic Info</p>
            <div className="space-y-2.5">
              {(user.course || user.college) && (
                <div className="flex items-center gap-2.5 text-sm">
                  <FaGraduationCap className="text-blue-500 flex-shrink-0 w-4 h-4" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{user.course || user.college}</p>
                    {user.course && user.college && (
                      <p className="text-xs text-gray-500 truncate">{user.college}</p>
                    )}
                  </div>
                </div>
              )}
              {(user.year || user.section) && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <ClipboardList className="text-blue-400 flex-shrink-0 w-4 h-4" />
                  <span>
                    {[user.year && `${user.year} Semester`, user.section && `Section ${user.section}`]
                      .filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}
              {!user.course && !user.year && !user.section && (
                <p className="text-xs text-gray-400 italic">No academic info added yet.</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Quick Actions Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Actions</p>
        </div>
        <ul className="px-3 pb-3 mt-1 space-y-0.5">
          {quickActions.map(({ icon, label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
              >
                <span className="text-gray-400 group-hover:text-blue-500 transition">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { FaPlus, FaFilter, FaCalendarCheck, FaSearch } from "react-icons/fa";
import Cards from "./cards";
import Slider from "./Slider";
import CreateEventModal from "./CreateEventModal";
import MobileFilterModal from "./MobileFilterModal";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useEvents } from "../../hooks/useEvents";

function Events() {
  const { currentUser } = useAuth();
  const { events, loading, refetch, error } = useEvents(); // Get error
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [eventToEdit, setEventToEdit] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (currentUser) setCurrentUserId(currentUser.uid);
  }, [currentUser]);

  const handleEventCreated = () => {
    // Event created/edited externally (in modal), so we just invalidate cache
    refetch();
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleCreateEvent = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = activeCategory ? event.category === activeCategory : true;

    let matchesDate = true;
    if (selectedDate) {
      if (!event.date) {
        matchesDate = false;
      } else {
        try {
          const eventDate = new Date(event.date).toISOString().split('T')[0];
          matchesDate = eventDate === selectedDate;
        } catch (e) {
          matchesDate = false;
        }
      }
    }

    let matchesType = true;
    const today = new Date().toISOString().split('T')[0];

    if (filterType === "All") {
      matchesType = true;
    } else if (event.date) {
      try {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        if (filterType === "Upcoming") {
          matchesType = eventDate > today;
        } else if (filterType === "Ongoing") {
          matchesType = eventDate >= today;
        }
      } catch (e) {
        matchesType = false;
      }
    } else {
      matchesType = false;
    }

    return matchesSearch && matchesCategory && matchesDate && matchesType;
  });

  const categories = [...new Set(filteredEvents.map((e) => e.category || "Upcoming Events"))];

  return (
    <div className="flex pt-0 gap-8 px-4 lg:px-8 min-h-screen bg-gray-50/50 pb-20">
      {/* Left Slider (Sidebar) */}
      <div className="hidden lg:block flex-shrink-0 w-80">
        <div className="fixed top-[74px] left-8 w-80 bottom-[10px] z-40 overflow-hidden">
          <Slider
            onSearch={setSearchText}
            onCategory={setActiveCategory}
            onDateSelect={setSelectedDate}
            onToggle={setFilterType}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0 pt-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 shadow-xl mb-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-center z-10 gap-6">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                Explore Events
              </h1>
              <p className="text-gray-300 max-w-lg text-lg">
                Join hackathons, workshops, and meetups. Connect with the best minds in the community.
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[140px]">
              <button
                onClick={handleCreateEvent}
                className="flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition hover:scale-105 active:scale-95 shadow-lg"
              >
                <FaPlus className="text-blue-600" />
                Host Event
              </button>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition border border-gray-700"
              >
                <FaFilter />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white h-96 rounded-2xl shadow-sm animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-red-100">
            <div className="text-red-500 mb-2">Failed to load events</div>
            <button onClick={() => refetch()} className="text-blue-600 hover:underline">Retry</button>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              const eventsOfCategory = filteredEvents.filter(
                (e) => (e.category || "Upcoming Events") === category
              );
              if (!eventsOfCategory.length) return null;

              return (
                <div key={category} className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-blue-600 rounded-full block"></span>
                      {category}
                      <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                        {eventsOfCategory.length}
                      </span>
                    </h2>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar scroll-smooth">
                    {eventsOfCategory.map((event) => (
                      <div key={event._id} className="flex-shrink-0 w-[320px] sm:w-[350px]">
                        <Cards
                          eventData={{
                            ...event,
                            organizerName: event.organizer?.name || "Unknown",
                            organizerTitle: "Organizer",
                            organizerAvatar: event.organizer?.profilePic,
                            eventImageUrl: event.imageUrl || "",
                            eventName: event.title,
                            eventPrize: event.prize || "No Prize",
                            eventDescription: event.description,
                            location: event.location, // Assuming backend has location
                            date: event.date
                          }}
                          onEdit={handleEditEvent}
                          currentUserId={currentUserId}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarCheck className="text-gray-300 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No events found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={handleEventCreated}
        eventToEdit={eventToEdit}
      />

      <MobileFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSearch={setSearchText}
        onCategory={setActiveCategory}
        onDateSelect={setSelectedDate}
        onToggle={setFilterType}
      />
    </div>
  );
}

export default Events;



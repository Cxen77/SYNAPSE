import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import Cards from "./cards";
import Slider from "./Slider";
import CreateEventModal from "./CreateEventModal";
import api from "../../api/axios";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [eventToEdit, setEventToEdit] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events');
      setEvents(data.events);

      // Get current user ID from local storage or decode token
      // Assuming user info is stored in localStorage 'userInfo'
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        setCurrentUserId(userInfo._id);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent, isEdit) => {
    if (isEdit) {
      setEvents(events.map(e => e._id === newEvent._id ? newEvent : e));
    } else {
      setEvents([...events, newEvent]);
    }
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleCreateEvent = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  // Filter events based on search, category, date, and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = activeCategory ? event.category === activeCategory : true;

    let matchesDate = true;
    if (selectedDate) {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      matchesDate = eventDate === selectedDate;
    }

    let matchesType = true;
    const today = new Date().toISOString().split('T')[0];
    const eventDate = new Date(event.date).toISOString().split('T')[0];

    if (filterType === "All") {
      matchesType = true;
    } else if (filterType === "Upcoming") {
      matchesType = eventDate > today;
    } else if (filterType === "Ongoing") {
      matchesType = eventDate >= today;
    }

    return matchesSearch && matchesCategory && matchesDate && matchesType;
  });

  const categories = [...new Set(filteredEvents.map((e) => e.category || "Upcoming Events"))];

  return (
    <div className="flex pt-0 gap-6 px-6 min-h-screen relative">
      {/* Left Slider */}
      <div className="flex-shrink-0">
        <Slider
          onSearch={setSearchText}
          onCategory={setActiveCategory}
          onDateSelect={setSelectedDate}
          onToggle={setFilterType}
        />
      </div>

      {/* Main Event Grid */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-500">Discover and join amazing events</p>
          </div>
          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <FaPlus />
            <span>Create Event</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => {
              const eventsOfCategory = filteredEvents.filter(
                (e) => (e.category || "Upcoming Events") === category
              );
              if (!eventsOfCategory.length) return null;

              return (
                <div key={category}>
                  {/* Category Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {category}
                  </h2>

                  {/* Flexible Cards */}
                  <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {eventsOfCategory.map((event) => (
                      <div
                        key={event._id}
                        className="flex-shrink-0 w-[300px]"
                      >
                        <Cards
                          eventData={{
                            ...event,
                            organizerName: event.organizer?.name || "Unknown",
                            organizerTitle: "Organizer",
                            organizerAvatar: event.organizer?.profilePic || "https://ui-avatars.com/api/?name=Organizer",
                            eventImageUrl: event.imageUrl || "",
                            eventName: event.title,
                            eventPrize: event.prize || "No Prize",
                            eventDescription: event.description
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
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No events found.</p>
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
    </div>
  );
}

export default Events;



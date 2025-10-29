
import { useState, useRef, useEffect } from "react";

const Slider = ({ onSearch, onCategory, onToggle }) => {
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [isOngoing, setIsOngoing] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const calendarRef = useRef();

  const categories = ["Tournament", "Game", "Hackathon", "Sport"];
  const liveUpdates = [
    "⚡ Hackathon registration closes in 2 hrs",
    "🎮 Gaming finals starting soon!",
    "🏆 Tournament leaderboard updates at 9PM",
  ];

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" })
  );
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  const handleCategoryClick = (cat) => {
    const newCat = cat === activeCategory ? "" : cat;
    setActiveCategory(newCat);
    onCategory?.(newCat);
  };

  const handleDateSelect = (day) => {
    const monthStr = (calendarMonth + 1).toString().padStart(2, "0");
    setSelectedDate(`${calendarYear}-${monthStr}-${day.toString().padStart(2, "0")}`);
    setShowCalendar(false);
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full lg:w-80 bg-gray-900 mt-2 text-white p-5 rounded-2xl shadow-2xl sticky top-[70px] max-h-[88vh] flex flex-col">
      
      {/* Fixed Header */}
      <div className="flex-shrink-0 space-y-5">
        <input
          type="text"
          placeholder="Search events..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-full px-4 py-2 rounded-md text-black focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Categories */}
        <div>
          <h3 className="uppercase text-gray-400 text-xs mb-2 tracking-wider">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3 py-1.5 text-sm rounded-full border transition ${
                  activeCategory === cat
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-600 hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Dark Calendar */}
        <div className="relative" ref={calendarRef}>
          <h3 className="uppercase text-gray-400 text-xs mb-2 tracking-wider">
            Event Date
          </h3>
          <div className="flex items-center relative">
            <input
              type="text"
              value={selectedDate}
              placeholder="Select a date"
              readOnly
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-4 py-2 rounded-md text-black cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span
              onClick={() => setShowCalendar(!showCalendar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
            >
              📅
            </span>
          </div>

          {showCalendar && (
            <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 text-white p-3 rounded-xl shadow-xl z-50">
              
              {/* Month & Year Custom Dropdown */}
              <div className="flex justify-between items-center mb-2">
                {/* Month */}
                <div className="relative">
                  <button
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    className="bg-gray-700 px-2 py-1 rounded w-20 text-left"
                  >
                    {months[calendarMonth]}
                  </button>
                  {showMonthDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-20 bg-gray-700 rounded shadow z-50 max-h-40 overflow-y-auto">
                      {months.map((m, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setCalendarMonth(i);
                            setShowMonthDropdown(false);
                          }}
                          className="px-2 py-1 cursor-pointer hover:bg-blue-600"
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year */}
                <div className="relative">
                  <button
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    className="bg-gray-700 px-2 py-1 rounded w-20 text-left"
                  >
                    {calendarYear}
                  </button>
                  {showYearDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-20 bg-gray-700 rounded shadow z-50 max-h-40 overflow-y-auto">
                      {years.map((y) => (
                        <div
                          key={y}
                          onClick={() => {
                            setCalendarYear(y);
                            setShowYearDropdown(false);
                          }}
                          className="px-2 py-1 cursor-pointer hover:bg-blue-600"
                        >
                          {y}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="font-bold">{d}</div>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }, (_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate.endsWith(`-${day.toString().padStart(2,"0")}`);
                  return (
                    <div
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`p-1 rounded cursor-pointer ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Show toggle */}
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
          <span className="text-sm">Show:</span>
          <button
            onClick={() => {
              setIsOngoing(!isOngoing);
              onToggle?.(!isOngoing ? "Ongoing" : "Upcoming");
            }}
            className="bg-blue-500 px-3 py-1 rounded-md text-sm"
          >
            {isOngoing ? "Ongoing" : "Upcoming"}
          </button>
        </div>
      </div>

      {/* Scrollable Section */}
      <div className="flex-1 mt-3 space-y-5 overflow-y-auto pr-2">
        <style>{`
          div::-webkit-scrollbar { display: none; }
          -ms-overflow-style: none;
          scrollbar-width: none;
        `}</style>

        {/* Live Updates */}
        <div>
          <h3 className="uppercase text-gray-400 text-xs mb-2 tracking-wider">
            Live Updates
          </h3>
          <ul className="space-y-1 text-sm text-gray-300">
            {liveUpdates.map((update, i) => (
              <li key={i} className="bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition">
                {update}
              </li>
            ))}
          </ul>
        </div>

        {/* Announcement */}
        <div className="bg-red-600 p-3 rounded-lg text-sm animate-pulse">
          🚨 Deadline: Hackathon registration ends in <b>2 hours</b>!
        </div>
      </div>
    </div>
  );
};

export default Slider;

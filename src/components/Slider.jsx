import { useState, useRef, useEffect } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";

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

  const categories = ["Hackathon", "Collab", "Tournament", "Project"];
  const liveUpdates = [
    "💡 New hackathon teams forming now!",
    "🎮 Esports tournament starting soon!",
    "🤝 Collaborate on AI project with new members!",
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
    <div className="w-full lg:w-80 bg-white text-gray-900 p-5 rounded-xl shadow-sm sticky top-[80px] max-h-[88vh] flex flex-col border border-gray-200">
      
      {/* 🔍 Search */}
      <div className="flex items-center bg-white rounded-xl px-3 py-2 mb-5 shadow-sm border border-gray-300">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 focus:ring-0"
        />
      </div>

      {/* 🏷 Categories */}
      <div className="mb-6">
        <h3 className="uppercase text-gray-500 text-xs mb-2 tracking-wider">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-blue-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 📅 Calendar */}
      <div className="relative mb-6" ref={calendarRef}>
        <h3 className="uppercase text-gray-500 text-xs mb-2 tracking-wider">
          Event Date
        </h3>
        <div className="flex items-center relative">
          <input
            type="text"
            value={selectedDate}
            placeholder="Select date"
            readOnly
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <FaCalendarAlt
            onClick={() => setShowCalendar(!showCalendar)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          />
        </div>

        {showCalendar && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 p-3 rounded-xl shadow-xl z-50 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              {/* Month */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="bg-white px-2 py-1 rounded w-20 text-left border border-gray-300"
                >
                  {months[calendarMonth]}
                </button>
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-200 rounded shadow z-50 max-h-40 overflow-y-auto">
                    {months.map((m, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCalendarMonth(i);
                          setShowMonthDropdown(false);
                        }}
                        className="px-2 py-1 cursor-pointer hover:bg-blue-50"
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
                  className="bg-white px-2 py-1 rounded w-20 text-left border border-gray-300"
                >
                  {calendarYear}
                </button>
                {showYearDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-200 rounded shadow z-50 max-h-40 overflow-y-auto">
                    {years.map((y) => (
                      <div
                        key={y}
                        onClick={() => {
                          setCalendarYear(y);
                          setShowYearDropdown(false);
                        }}
                        className="px-2 py-1 cursor-pointer hover:bg-blue-50"
                      >
                        {y}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from(
                { length: new Date(calendarYear, calendarMonth + 1, 0).getDate() },
                (_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate.endsWith(
                    `-${day.toString().padStart(2, "0")}`
                  );
                  return (
                    <div
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`p-1 rounded cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {day}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🔄 Toggle */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white p-3 rounded-xl mb-5 border border-gray-300">
        <span className="text-sm text-gray-700">Show:</span>
        <button
          onClick={() => {
            setIsOngoing(!isOngoing);
            onToggle?.(!isOngoing ? "Ongoing" : "Upcoming");
          }}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm text-white transition"
        >
          {isOngoing ? "Ongoing" : "Upcoming"}
        </button>
      </div>

      {/* 🧠 Live Updates */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <div>
          <h3 className="uppercase text-gray-500 text-xs mb-2 tracking-wider">
            Live Updates
          </h3>
          <ul className="space-y-1 text-sm text-gray-800">
            {liveUpdates.map((update, i) => (
              <li
                key={i}
                className="bg-gray-50 p-2 rounded-lg hover:bg-blue-50 transition border border-gray-200"
              >
                {update}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300 p-3 rounded-lg text-sm text-blue-800 font-medium">
          🚀 New collaboration spaces open — find your next project partner!
        </div>
      </div>
    </div>
  );
};

export default Slider;
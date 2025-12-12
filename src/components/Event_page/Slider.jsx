import { useState, useRef, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaFire, FaBolt } from "react-icons/fa";

const Slider = ({ onSearch, onCategory, onToggle, onDateSelect }) => {
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

  const categories = ["Hackathon", "Workshop", "Seminar", "Tournament", "Meetup", "Project", "Game", "Sport"];
  const liveUpdates = [
    { text: "New hackathon teams forming now!", icon: "💡" },
    { text: "Esports tournament starting soon!", icon: "🎮" },
    { text: "Collaborate on AI project with new members!", icon: "🤝" },
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
    const dateStr = `${calendarYear}-${monthStr}-${day.toString().padStart(2, "0")}`;

    if (selectedDate === dateStr) {
      setSelectedDate("");
      onDateSelect?.("");
    } else {
      setSelectedDate(dateStr);
      onDateSelect?.(dateStr);
    }
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
    <div className="w-full bg-white text-gray-900 px-5 py-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col border border-gray-100/50 h-full overflow-hidden">

      {/* 🔍 Search */}
      <div className="relative mb-6 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-[15px] font-semibold rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block pl-10 p-3 outline-none transition-all placeholder-gray-400"
        />
      </div>

      {/* 🏷 Categories */}
      <div className="mb-6">
        <h3 className="uppercase text-gray-400 text-[13px] font-extrabold mb-3 tracking-widest flex items-center gap-2">
          <FaBolt className="text-yellow-500" /> Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 border ${activeCategory === cat
                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 📅 Calendar */}
      <div className="relative mb-6" ref={calendarRef}>
        <h3 className="uppercase text-gray-400 text-[13px] font-extrabold mb-3 tracking-widest flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500" /> Filter by Date
        </h3>
        <div className="flex items-center relative">
          <input
            type="text"
            value={selectedDate}
            placeholder="Select date"
            readOnly
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full pl-4 pr-10 py-3 rounded-xl bg-white text-gray-700 border border-gray-200 cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-bold shadow-sm"
          />
          <FaCalendarAlt
            onClick={() => setShowCalendar(!showCalendar)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
          />
        </div>

        {showCalendar && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 p-4 rounded-2xl shadow-2xl z-50 border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-left text-sm font-bold text-gray-700 transition-colors"
                >
                  {months[calendarMonth]}
                </button>
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar">
                    {months.map((m, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCalendarMonth(i);
                          setShowMonthDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-600 hover:text-blue-600"
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-left text-sm font-bold text-gray-700 transition-colors"
                >
                  {calendarYear}
                </button>
                {showYearDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-20 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto no-scrollbar">
                    {years.map((y) => (
                      <div
                        key={y}
                        onClick={() => {
                          setCalendarYear(y);
                          setShowYearDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-600 hover:text-blue-600"
                      >
                        {y}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
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
                      className={`h-8 flex items-center justify-center rounded-lg cursor-pointer text-sm font-bold transition-all ${isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
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
      <div className="bg-gray-50 p-1 rounded-xl mb-6 flex border border-gray-200/50">
        <button
          onClick={() => { setIsOngoing(true); onToggle?.("All"); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isOngoing ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          All Events
        </button>
        <button
          onClick={() => { setIsOngoing(false); onToggle?.("Upcoming"); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isOngoing ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Upcoming
        </button>
      </div>

      {/* 🧠 Live Updates */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <h3 className="uppercase text-gray-400 text-[13px] font-extrabold mb-3 tracking-widest flex items-center gap-2">
          <FaFire className="text-orange-500" /> Live Updates
        </h3>
        <div className="space-y-2 overflow-y-auto no-scrollbar">
          {liveUpdates.map((update, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl border border-gray-100 flex gap-3 items-start group hover:border-blue-200 transition-colors"
            >
              <span className="text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-center border border-gray-100 flex-shrink-0">{update.icon}</span>
              <p className="text-xs text-gray-600 leading-relaxed font-bold pt-0.5">
                {update.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
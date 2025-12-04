import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaTimes, FaFilter } from "react-icons/fa";

const MobileFilterModal = ({ isOpen, onClose, onSearch, onCategory, onToggle, onDateSelect }) => {
    const [searchText, setSearchText] = useState("");
    const [activeCategory, setActiveCategory] = useState("");
    const [isOngoing, setIsOngoing] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const categories = ["Hackathon", "Workshop", "Seminar", "Tournament", "Meetup", "Project", "Game", "Sport"];
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <FaFilter className="text-blue-600" />
                        Filter Events
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-6">

                    {/* 🔍 Search */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search</label>
                        <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition">
                            <FaSearch className="text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    onSearch?.(e.target.value);
                                }}
                                className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* 🔄 Toggle */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">View</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => { setIsOngoing(true); onToggle?.("All"); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${isOngoing ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All Events
                            </button>
                            <button
                                onClick={() => { setIsOngoing(false); onToggle?.("Upcoming"); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${!isOngoing ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Upcoming
                            </button>
                        </div>
                    </div>

                    {/* 🏷 Categories */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${activeCategory === cat
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 📅 Calendar */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                        <div className="relative">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                            >
                                <span className={selectedDate ? "font-medium text-gray-900" : "text-gray-400"}>
                                    {selectedDate || "Select a date"}
                                </span>
                                <FaCalendarAlt className="text-gray-400" />
                            </button>

                            {showCalendar && (
                                <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        {/* Month */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                                className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                {months[calendarMonth]}
                                            </button>
                                            {showMonthDropdown && (
                                                <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                                                    {months.map((m, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => {
                                                                setCalendarMonth(i);
                                                                setShowMonthDropdown(false);
                                                            }}
                                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700"
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
                                                className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                {calendarYear}
                                            </button>
                                            {showYearDropdown && (
                                                <div className="absolute top-full right-0 mt-1 w-20 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                                                    {years.map((y) => (
                                                        <div
                                                            key={y}
                                                            onClick={() => {
                                                                setCalendarYear(y);
                                                                setShowYearDropdown(false);
                                                            }}
                                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700"
                                                        >
                                                            {y}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
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
                                                        className={`h-8 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition ${isSelected
                                                            ? "bg-blue-600 text-white shadow-md"
                                                            : "text-gray-700 hover:bg-blue-50"
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
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileFilterModal;

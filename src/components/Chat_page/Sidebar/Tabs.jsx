function Tabs() {
  return (
    <div className="flex px-4 py-2 border-b border-gray-200 flex-shrink-0">
      <button className="flex-1 text-sm font-bold text-gray-900 pb-2 border-b-2 border-blue-600">
        Messages
      </button>

      <button
        className="
          flex-1 text-sm font-medium text-gray-600 pb-2 hover:text-gray-900 transition 
          flex items-center justify-center gap-1
        "
      >
        Requests
        <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
          2
        </span>
      </button>
    </div>
  );
}

export default Tabs;

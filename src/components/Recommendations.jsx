import React from "react";

const people = [
  { name: "Jerome Bell", title: "Interaction Designer", mutuals: 12 },
  { name: "Cody Fisher", title: "Interaction Designer", mutuals: 8 },
  { name: "Cameron Williamson", title: "Product Designer", mutuals: 5 },
];

export default function Recommendations() {
  return (
    <aside className="bg-white rounded-2xl shadow-sm p-6 sticky top-28 self-start">
      <h4 className="font-semibold mb-3">Recommended for You</h4>

      <div className="space-y-3">
        {people.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.title} • {p.mutuals} mutuals</div>
              </div>
            </div>
            <button className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm">+</button>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      <div className="text-sm text-gray-500">Add to your feed</div>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex justify-between items-center">
          <span>Figma</span>
          <button className="text-blue-600">Follow</button>
        </li>
        <li className="flex justify-between items-center">
          <span>Webflow</span>
          <button className="text-blue-600">Follow</button>
        </li>
      </ul>
    </aside>
  );
}

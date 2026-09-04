import React from "react";
import {
  Film,
  Tv,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  FileText,
  Ban,
} from "lucide-react";

export default function DataTable({ items = [], onEdit, onDelete, onView }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-[#1e2020] p-8 rounded-xl border border-gray-800 text-center">
        <p className="text-sm text-[#bfc7d1]">
          No titles currently listed in the catalog management view.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2020] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#e3e2e2]">
          <thead className="bg-[#121414] text-xs uppercase text-[#a1c9ff] border-b border-gray-800 tracking-wider">
            <tr>
              <th className="p-4">Title / Poster</th>
              <th className="p-4">Type</th>
              <th className="p-4">Release Year</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map((item) => {
              const isSeries = Boolean(item.seasons || item.type === "series");
              const poster =
                item.poster_url ||
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
              const status = item.status || "Available";

              return (
                <tr key={item.id} className="hover:bg-[#121414]/50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded bg-gray-900 border border-gray-800"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
                      }}
                    />
                    <div>
                      <p className="font-bold text-white text-sm line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#bfc7d1] line-clamp-1">
                        {item.genres
                          ? item.genres.map((g) => g.name || g).join(", ")
                          : "Uncategorized"}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 text-[#a1c9ff] border border-gray-700">
                      {isSeries ? (
                        <Tv className="w-3.5 h-3.5" />
                      ) : (
                        <Film className="w-3.5 h-3.5" />
                      )}
                      <span>{isSeries ? "Series" : "Movie"}</span>
                    </span>
                  </td>

                  <td className="p-4 text-xs font-medium text-[#bfc7d1]">
                    {item.release_year || "N/A"}
                  </td>

                  <td className="p-4 text-xs font-semibold">
                    <span className="border border-gray-700 px-2 py-0.5 rounded text-gray-300">
                      {item.age_rating || "NR"}
                    </span>
                  </td>

                  <td className="p-4">
                    {status === "Available" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/30 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Available
                      </span>
                    )}
                    {status === "Draft" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#facc15] bg-[#facc15]/10 border border-[#facc15]/30 px-2.5 py-0.5 rounded-full">
                        <FileText className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                    {status === "SoftDeleted" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/30 px-2.5 py-0.5 rounded-full">
                        <Ban className="w-3 h-3" />
                        Soft Deleted
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView && onView(item)}
                        className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-[#a1c9ff] transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(item)}
                        className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white transition"
                        title="Edit Entry"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(item)}
                        className="p-1.5 rounded bg-gray-800 hover:bg-[#f87171]/20 text-[#f87171] transition"
                        title="Soft Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

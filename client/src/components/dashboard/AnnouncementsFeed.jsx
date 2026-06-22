import React, { useState } from "react";
import Badge from "../common/Badge.jsx";
import Button from "../common/Button.jsx";

export default function AnnouncementsFeed({
  announcements = [],
  discussions = [],
  onAddComment,
}) {
  const [activeTab, setActiveTab] = useState("announcements");
  const [commentText, setCommentText] = useState({});

  const handleCommentSubmit = (discussionId) => {
    if (!commentText[discussionId]?.trim()) return;
    onAddComment(discussionId, commentText[discussionId]);
    setCommentText({ ...commentText, [discussionId]: "" });
  };

  return (
    <div className="card-surface p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("announcements")}
            className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
              activeTab === "announcements"
                ? "border-[#6366F1] text-[#6366F1]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("discussions")}
            className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
              activeTab === "discussions"
                ? "border-[#6366F1] text-[#6366F1]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Discussions
          </button>
        </div>
      </div>

      {activeTab === "announcements" ? (
        <div className="flex flex-col gap-4">
          {announcements.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No announcements available.
            </p>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                      {ann.title}
                      {ann.title.toLowerCase().includes("water") && (
                        <Badge status="Warning" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-2">{ann.content}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {discussions.length === 0 ? (
            <p className="text-slate-400 text-sm">No discussions available.</p>
          ) : (
            discussions.map((disc) => (
              <div
                key={disc.id}
                className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-semibold text-slate-200">
                      {disc.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Posted by {disc.resident_name} •{" "}
                      {new Date(disc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={`${disc.comments_count || 0} Comments`} />
                </div>
                <p className="text-sm text-slate-300 mt-2">{disc.content}</p>

                <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText[disc.id] || ""}
                    onChange={(e) =>
                      setCommentText({
                        ...commentText,
                        [disc.id]: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                  <Button
                    onClick={() => handleCommentSubmit(disc.id)}
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

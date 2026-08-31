import React, { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../common/Badge";
import { Send, Edit2, Trash2, Check, X, MessageSquare } from "lucide-react";

export const CommentThread = ({
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  loading = false,
}) => {
  const { user, isAdmin } = useAuth();
  const [newCommentBody, setNewCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingBody, setEditingBody] = useState("");
  const [error, setError] = useState("");

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    try {
      setSubmitting(true);
      setError("");
      await onAddComment(newCommentBody.trim());
      setNewCommentBody("");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : null) ||
        "Failed to post comment.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditingBody(comment.body);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingBody("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingBody.trim()) return;
    try {
      setError("");
      await onEditComment(commentId, editingBody.trim());
      setEditingId(null);
      setEditingBody("");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : null) ||
        "Failed to update comment.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleDelete = async (commentId) => {
    try {
      setError("");
      await onDeleteComment(commentId);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : null) ||
        "Failed to delete comment.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-900">
          Activity & Comments ({comments.length})
        </h3>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
        >
          {error}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleAddSubmit} className="space-y-2">
        <textarea
          rows="3"
          value={newCommentBody}
          onChange={(e) => setNewCommentBody(e.target.value)}
          placeholder="Leave a comment or update on this task..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newCommentBody.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Posting..." : "Post Comment"}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = user?.id === comment.author_id;
            const canModify = isAuthor || isAdmin;
            const isEditing = editingId === comment.id;
            const authorName = comment.author?.full_name || "Team Member";
            const authorRole = comment.author?.role || "Member";
            const formattedDate = new Date(comment.created_at).toLocaleString(
              undefined,
              {
                dateStyle: "medium",
                timeStyle: "short",
              },
            );

            return (
              <div
                key={comment.id}
                data-testid="comment-item"
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {authorName}
                        </span>
                        <Badge
                          label={authorRole}
                          variant={authorRole}
                          className="text-[10px] px-1.5 py-0"
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {canModify && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(comment)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-50 transition-colors"
                        title="Edit comment"
                        aria-label="Edit comment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition-colors"
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      rows="2"
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {comment.body}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

CommentThread.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      task_id: PropTypes.string.isRequired,
      author_id: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      author: PropTypes.shape({
        id: PropTypes.string,
        full_name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
      }),
    }),
  ),
  onAddComment: PropTypes.func.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CommentThread;

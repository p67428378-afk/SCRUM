import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Mail,
  MailOpen,
  Send,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/api/v1/messages");
      setMessages(response.data);
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await api.put(`/api/v1/messages/${msg.id}`, { is_read: true });
        // Update local state
        setMessages(
          messages.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
        );
      } catch (err) {
        console.error("Failed to mark message as read", err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required");
      return;
    }

    try {
      const payload = {
        subject,
        body,
      };
      if (recipientUsername.trim()) {
        payload.recipient_username = recipientUsername.trim();
      }

      await api.post("/api/v1/messages", payload);
      setSuccess("Message sent successfully!");
      setSubject("");
      setBody("");
      setRecipientUsername("");
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send message");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Secure Messaging Inbox
        </h1>
        <p className="text-slate-400">
          Communicate securely with bank support and other users. All messages
          are end-to-end encrypted.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inbox List */}
        <div className="lg:col-span-5 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Inbox</h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-medium">
              {messages.filter((m) => !m.is_read).length} Unread
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No messages in your inbox.
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                    selectedMessage?.id === msg.id
                      ? "bg-indigo-500/10 border-l-4 border-indigo-500"
                      : "hover:bg-slate-700/30"
                  }`}
                >
                  <div className="mt-1">
                    {msg.is_read ? (
                      <MailOpen className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span
                        className={`text-sm truncate ${!msg.is_read ? "font-semibold text-white" : "text-slate-300"}`}
                      >
                        {msg.sender || "System"}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4
                      className={`text-sm truncate ${!msg.is_read ? "font-semibold text-white" : "text-slate-400"}`}
                    >
                      {msg.subject}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {msg.body}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Detail & Compose */}
        <div className="lg:col-span-7 space-y-8">
          {/* Selected Message Detail */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg min-h-[250px] flex flex-col justify-between">
            {selectedMessage ? (
              <div>
                <div className="flex justify-between items-start border-b border-slate-700 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedMessage.subject}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      From:{" "}
                      <span className="text-indigo-400 font-medium">
                        {selectedMessage.sender || "System"}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.body}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                <Mail className="w-12 h-12 text-slate-600 mb-2" />
                Select a message from the inbox to view details.
              </div>
            )}
          </div>

          {/* Compose Message Form */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              Compose Secure Message
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Recipient Username (Optional - leave blank for Support)
                </label>
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  placeholder="e.g. support_agent"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this regarding?"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your secure message here..."
                  required
                  rows="4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Secure Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

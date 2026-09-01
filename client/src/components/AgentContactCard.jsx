import React, { useState } from "react";
import { Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export default function AgentContactCard({ agent = {}, propertyTitle = "" }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${propertyTitle || "this property"}. Please contact me.`,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          {(agent.full_name || "Agent")
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            {agent.full_name || "Sarah Jenkins"}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Licensed Real Estate Agent
          </p>
          <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>{agent.phone_number || "(512) 555-0199"}</span>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-sm">Message Sent!</h4>
          <p className="text-xs text-emerald-700">
            The agent has received your inquiry and will reach out shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="font-semibold text-slate-900 text-sm">
            Contact Agent
          </h4>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Your Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Message
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      )}
    </div>
  );
}

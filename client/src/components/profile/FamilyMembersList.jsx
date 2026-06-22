import React, { useState, useEffect } from "react";
import Button from "../common/Button.jsx";

export default function FamilyMembersList({ familyMembers = [], onUpdate }) {
  const [members, setMembers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("Spouse");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    setMembers(familyMembers);
  }, [familyMembers]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const updated = [
      ...members,
      { name: newName, relationship: newRelationship, phone_number: newPhone },
    ];
    setMembers(updated);
    onUpdate(updated);
    setNewName("");
    setNewPhone("");
  };

  const handleRemoveMember = (index) => {
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
    onUpdate(updated);
  };

  return (
    <div className="card-surface p-6 flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Family Members
      </h3>

      <div className="flex flex-col gap-4">
        {members.length === 0 ? (
          <p className="text-slate-400 text-sm">No family members added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 flex justify-between items-center"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {member.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {member.relationship}{" "}
                    {member.phone_number ? `• ${member.phone_number}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMember(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleAddMember}
        className="border-t border-slate-800 pt-6 flex flex-col gap-4"
      >
        <h4 className="text-sm font-semibold text-slate-300">
          Add Family Member
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              placeholder="e.g. Jane Doe"
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Relationship
            </label>
            <select
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
            >
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Phone Number
            </label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2835"
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary">
            Add Member
          </Button>
        </div>
      </form>
    </div>
  );
}

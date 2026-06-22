import React from "react";
import PersonalDetailsForm from "../components/profile/PersonalDetailsForm.jsx";
import FamilyMembersList from "../components/profile/FamilyMembersList.jsx";

export default function ProfilePage({
  resident,
  onSaveProfile,
  onUpdateFamily,
}) {
  return (
    <div className="flex flex-col gap-6">
      <PersonalDetailsForm resident={resident} onSave={onSaveProfile} />
      <FamilyMembersList
        familyMembers={resident?.family_members || []}
        onUpdate={onUpdateFamily}
      />
    </div>
  );
}

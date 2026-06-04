
import React from 'react';
import AnnouncementCard from './AnnouncementCard';

const AnnouncementList = ({ announcements }) => {
  if (!announcements || announcements.length === 0) {
    return <p className="text-center text-on-surface-variant">No announcements found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
      {announcements.map(announcement => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
};

export default AnnouncementList;

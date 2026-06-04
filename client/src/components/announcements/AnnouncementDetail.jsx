
import React from 'react';
import { Link } from 'react-router-dom';

const AnnouncementDetail = ({ announcement }) => {
  if (!announcement) {
    return <p>Announcement not found.</p>;
  }

  const { title, content, publication_date, author, category } = announcement;

  return (
    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
            <div>
                <span className="px-3 py-1 bg-primary-container/10 text-primary rounded-full text-label-sm font-label-sm mb-4 inline-block">{category}</span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-outline">
                    <span>By {author}</span>
                    <span>{new Date(publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
            <Link to="/announcements" className="text-primary font-label-md flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to list
            </Link>
        </div>

        <div className="prose max-w-none text-body-md text-on-surface-variant">
            {content}
        </div>
    </div>
  );
};

export default AnnouncementDetail;

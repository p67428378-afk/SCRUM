
import React from 'react';
import { Link } from 'react-router-dom';

const AnnouncementCard = ({ announcement }) => {
  const { id, category, publication_date, title, summary, author } = announcement;

  const categoryColors = {
    Meeting: 'bg-tertiary-container/10 text-tertiary-container',
    Maintenance: 'bg-error-container/20 text-error',
    Social: 'bg-primary-container/10 text-primary',
    default: 'bg-secondary-container text-on-secondary-container',
  };

  const categoryIcon = {
      Meeting: 'groups',
      Maintenance: 'build',
      Social: 'celebration',
      default: 'campaign'
  }

  return (
    <article className="announcement-card bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm ${categoryColors[category] || categoryColors.default}`}>{category}</span>
        <span className="text-label-sm text-outline font-label-sm">{new Date(publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{title}</h3>
      <p className="text-body-md text-on-surface-variant flex-1 mb-6">{summary}</p>
      <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-on-secondary-container" data-icon={categoryIcon[category] || categoryIcon.default}>{categoryIcon[category] || categoryIcon.default}</span>
          </div>
          <span className="text-label-sm text-on-surface-variant font-label-sm">{author}</span>
        </div>
        <Link to={`/announcements/${id}`} className="text-primary font-label-md flex items-center gap-1 hover:underline">
          Read More <span className="material-symbols-outlined text-[18px]" data-icon="chevron_right">chevron_right</span>
        </Link>
      </div>
    </article>
  );
};

export default AnnouncementCard;

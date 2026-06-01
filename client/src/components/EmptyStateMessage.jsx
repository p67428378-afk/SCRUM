
import React from 'react';

const EmptyStateMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-xl text-center space-y-md opacity-60">
      <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-md">
        <span className="material-symbols-outlined text-[48px] text-outline">task_alt</span>
      </div>
      <h3 className="text-headline-md font-headline-md text-on-surface">No tasks yet!</h3>
      <p className="text-body-md font-body-md text-outline">Add one above to get your day started.</p>
    </div>
  );
};

export default EmptyStateMessage;

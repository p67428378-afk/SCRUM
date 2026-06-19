import React from "react";

export default function SavedLocationCard({
  location,
  onSelect,
  onSetDefault,
  onDelete,
}) {
  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
      <div
        className="flex items-center gap-3 cursor-pointer flex-1"
        onClick={() => onSelect(location.name)}
      >
        <span className="material-symbols-outlined text-primary">
          location_on
        </span>
        <div>
          <h4 className="font-body-lg text-body-lg font-semibold text-on-surface flex items-center gap-2">
            {location.name}
            {location.country && (
              <span className="text-xs text-on-surface-variant">
                ({location.country})
              </span>
            )}
            {location.is_default && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-label-caps rounded-full">
                Default
              </span>
            )}
          </h4>
          <p className="text-xs text-on-surface-variant">
            Saved on {new Date(location.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!location.is_default && onSetDefault && (
          <button
            onClick={() => onSetDefault(location.id)}
            className="px-3 py-1.5 bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-md transition-colors font-label-caps text-[10px]"
          >
            Set Default
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(location.id)}
            className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-highest rounded-full transition-colors"
            aria-label="Delete Location"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

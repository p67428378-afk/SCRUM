import React from "react";

export default function UpcomingDeadlinesWidget({ deadlines = [] }) {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending") {
      return "bg-[#F59E0B]/10 text-[#F59E0B]";
    } else if (s === "in progress") {
      return "bg-[#3B82F6]/10 text-[#3B82F6]";
    } else if (s === "completed") {
      return "bg-[#10B981]/10 text-[#10B981]";
    }
    return "bg-surface-container-highest text-on-surface-variant";
  };

  const getIconStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending") {
      return {
        bg: "bg-[#F59E0B]/10",
        text: "text-[#F59E0B]",
        icon: "assignment_late",
      };
    } else if (s === "in progress") {
      return { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", icon: "code" };
    }
    return {
      bg: "bg-[#10B981]/10",
      text: "text-[#10B981]",
      icon: "check_circle",
    };
  };

  return (
    <div className="xl:col-span-4 bg-surface-container-high border border-outline-variant rounded-lg p-card_padding flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Upcoming Deadlines
        </h3>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">
          more_horiz
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {deadlines.length === 0 ? (
          <p className="text-center text-on-surface-variant py-8">
            No upcoming deadlines.
          </p>
        ) : (
          deadlines.map((deadline, index) => {
            const iconInfo = getIconStyles(deadline.status);
            return (
              <div
                key={deadline.id || index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer border border-transparent hover:border-outline-variant"
              >
                <div className={`${iconInfo.bg} p-2 rounded-lg mt-1`}>
                  <span
                    className={`material-symbols-outlined ${iconInfo.text} text-[20px]`}
                  >
                    {iconInfo.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-body-lg text-body-lg text-on-surface truncate">
                      {deadline.title}
                    </span>
                    <span
                      className={`${getStatusStyles(deadline.status)} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap`}
                    >
                      {deadline.status}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant truncate">
                    {deadline.course_name || "Academic Task"}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">
                      event
                    </span>
                    <span className="font-label-md text-label-md">
                      {formatDate(deadline.due_date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <button className="mt-auto w-full py-2.5 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-highest hover:text-primary transition-colors mt-6">
        View Calendar
      </button>
    </div>
  );
}

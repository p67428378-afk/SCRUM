import React from "react";

export const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: "transfer",
      title: "Transfer Money",
      icon: "send",
      description: "Move funds between accounts",
    },
    {
      id: "pay_bill",
      title: "Pay Bill",
      icon: "receipt_long",
      description: "Pay external payees",
    },
    {
      id: "statements",
      title: "View Statements",
      icon: "assignment",
      description: "Download PDF statements",
    },
    {
      id: "new_account",
      title: "New Account",
      icon: "add_card",
      description: "Apply for a new account",
    },
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="flex flex-col items-center justify-center p-4 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg transition-all group text-center"
          >
            <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="font-semibold text-sm text-white mb-1">
              {action.title}
            </span>
            <span className="text-xs text-slate-400 hidden md:block">
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

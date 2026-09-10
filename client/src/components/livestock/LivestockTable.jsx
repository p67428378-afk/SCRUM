import React from "react";
import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";
import { PlusCircle, FileText } from "lucide-react";

export default function LivestockTable({ livestockData, onLogHealthEvent }) {
  const columns = [
    {
      header: "Tag / ID Number",
      accessor: "tag_number",
      render: (row) => (
        <div className="font-bold text-slate-800 flex items-center space-x-1.5">
          <span>{row.tag_number}</span>
        </div>
      ),
    },
    {
      header: "Species & Breed",
      accessor: "species",
      render: (row) => (
        <div>
          <span className="font-semibold">{row.species}</span>
          <span className="text-slate-500 text-[11px] block">{row.breed}</span>
        </div>
      ),
    },
    {
      header: "Birth Date",
      accessor: "birth_date",
    },
    {
      header: "Health Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Health Logs",
      accessor: "health_records_count",
      render: (row) => (
        <span className="inline-flex items-center space-x-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
          <FileText className="w-3 h-3 text-slate-500" />
          <span>{row.health_records_count || 1} records</span>
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => onLogHealthEvent(row)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-bold transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Health Event</span>
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={livestockData}
      searchPlaceholder="Search tag #, species, or breed..."
      emptyMessage="No livestock records found."
    />
  );
}

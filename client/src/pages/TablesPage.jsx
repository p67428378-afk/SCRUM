import React, { useState, useEffect } from "react";
import TableFloorPlan from "../components/tables/TableFloorPlan";
import ReservationForm from "../components/tables/ReservationForm";
import { getTables, createReservation } from "../services/api";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const fetchTablesData = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (err) {
      console.error("Failed to load tables:", err);
    }
  };

  useEffect(() => {
    fetchTablesData();
  }, []);

  const handleBookReservation = async (payload) => {
    await createReservation(payload);
    fetchTablesData();
  };

  return (
    <div className="space-y-6">
      <TableFloorPlan
        tables={tables}
        onReserveTableClick={(tbl) => {
          setSelectedTable(tbl && tbl.id ? tbl : null);
          setIsReservationOpen(true);
        }}
      />

      <ReservationForm
        isOpen={isReservationOpen}
        onClose={() => {
          setIsReservationOpen(false);
          setSelectedTable(null);
        }}
        tables={tables}
        preselectedTable={selectedTable}
        onBookReservation={handleBookReservation}
      />
    </div>
  );
}

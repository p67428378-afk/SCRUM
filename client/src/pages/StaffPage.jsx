import React, { useState, useEffect } from "react";
import StaffTable from "../components/StaffTable";
import StaffTimeline from "../components/StaffTimeline";
import {
  getStaff,
  createStaff,
  getServices,
  getAppointments,
} from "../services/api";

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffData, srvData, aptData] = await Promise.all([
        getStaff().catch(() => [
          {
            id: "stf-1",
            full_name: "Sarah Jenkins",
            email: "sarah@salon.com",
            phone: "555-0111",
            working_hours: "09:00 - 17:00",
            is_active: true,
          },
          {
            id: "stf-2",
            full_name: "Elena Rostova",
            email: "elena@salon.com",
            phone: "555-0122",
            working_hours: "09:00 - 17:00",
            is_active: true,
          },
          {
            id: "stf-3",
            full_name: "Marcus Chen",
            email: "marcus@salon.com",
            phone: "555-0133",
            working_hours: "09:00 - 17:00",
            is_active: true,
          },
        ]),
        getServices().catch(() => [
          { id: "srv-1", name: "Haircut & Styling" },
          { id: "srv-2", name: "Coloring & Highlights" },
          { id: "srv-3", name: "Facial & Skincare" },
        ]),
        getAppointments().catch(() => []),
      ]);

      setStaffList(staffData || []);
      setServices(srvData || []);
      setAppointments(aptData || []);
    } catch (err) {
      console.error("Error fetching staff page data:", err);
    }
  };

  const handleStaffCreated = async (newStaffData) => {
    try {
      await createStaff(newStaffData);
    } catch (err) {
      console.warn("Backend staff creation fallback:", err);
      setStaffList((prev) => [
        ...prev,
        { ...newStaffData, id: `stf-${Date.now()}` },
      ]);
    }
    fetchData();
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-rose-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-[#5B1D2E]">
          Staff Scheduling & Management
        </h1>
        <p className="text-sm text-[#534345]">
          Configure stylist working hours, assign callable skills, and inspect
          shift timelines.
        </p>
      </div>

      <StaffTable
        staffList={staffList}
        services={services}
        onStaffCreated={handleStaffCreated}
      />

      <StaffTimeline staffList={staffList} appointments={appointments} />
    </div>
  );
}

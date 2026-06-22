import React, { useState, useEffect } from "react";
import AppLayout from "./components/layout/AppLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MaintenancePage from "./pages/MaintenancePage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import FacilitiesPage from "./pages/FacilitiesPage.jsx";
import Modal from "./components/common/Modal.jsx";
import Button from "./components/common/Button.jsx";
import Badge from "./components/common/Badge.jsx";
import {
  getResident,
  updateResident,
  getBills,
  makePayment,
  getAnnouncements,
  getDiscussions,
  postComment,
  getFacilities,
  bookFacility,
  getBookings,
  preApproveVisitor,
  getVisitorLog,
  createMaintenanceRequest,
  getMaintenanceRequests,
} from "./services/api.js";

const DEFAULT_RESIDENT_ID = "11111111-1111-1111-1111-111111111111";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [resident, setResident] = useState(null);
  const [bills, setBills] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [facilities, setFacilities] = useState([]);

  // Visitor Pre-approval Modal State
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [visitorError, setVisitorError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const resData = await getResident(DEFAULT_RESIDENT_ID);
      setResident(resData);

      const billsData = await getBills(DEFAULT_RESIDENT_ID);
      setBills(billsData);

      const maintData = await getMaintenanceRequests(DEFAULT_RESIDENT_ID);
      setMaintenanceRequests(maintData);

      const bookingsData = await getBookings(DEFAULT_RESIDENT_ID);
      setBookings(bookingsData);

      const visitorsData = await getVisitorLog(DEFAULT_RESIDENT_ID);
      setVisitors(visitorsData);

      const annData = await getAnnouncements();
      setAnnouncements(annData);

      const discData = await getDiscussions();
      setDiscussions(discData);

      const facData = await getFacilities();
      setFacilities(facData);
    } catch {
      // Silent catch or fallback
    }
  };

  const handleSaveProfile = async (profileData) => {
    const updated = await updateResident(DEFAULT_RESIDENT_ID, {
      ...profileData,
      family_members: resident?.family_members || [],
    });
    setResident(updated);
  };

  const handleUpdateFamily = async (familyMembers) => {
    const updated = await updateResident(DEFAULT_RESIDENT_ID, {
      name: resident.name,
      email: resident.email,
      phone_number: resident.phone_number,
      family_members: familyMembers,
    });
    setResident(updated);
  };

  const handleMakePayment = async (paymentData) => {
    await makePayment(paymentData);
    const billsData = await getBills(DEFAULT_RESIDENT_ID);
    setBills(billsData);
  };

  const handleAddComment = async (discussionId, content) => {
    await postComment(discussionId, {
      resident_id: DEFAULT_RESIDENT_ID,
      content,
    });
    const discData = await getDiscussions();
    setDiscussions(discData);
  };

  const handleBookFacility = async (bookingData) => {
    await bookFacility({
      ...bookingData,
      resident_id: DEFAULT_RESIDENT_ID,
    });
    const bookingsData = await getBookings(DEFAULT_RESIDENT_ID);
    setBookings(bookingsData);
  };

  const handlePreApproveVisitor = async (e) => {
    e.preventDefault();
    setVisitorError(null);
    try {
      await preApproveVisitor({
        resident_id: DEFAULT_RESIDENT_ID,
        name: visitorName,
        expected_arrival: new Date(expectedArrival).toISOString(),
      });
      const visitorsData = await getVisitorLog(DEFAULT_RESIDENT_ID);
      setVisitors(visitorsData);
      setIsVisitorModalOpen(false);
      setVisitorName("");
      setExpectedArrival("");
    } catch {
      setVisitorError("Failed to pre-approve visitor.");
    }
  };

  const handleCreateMaintenanceRequest = async (requestData) => {
    await createMaintenanceRequest({
      ...requestData,
      resident_id: DEFAULT_RESIDENT_ID,
    });
    const maintData = await getMaintenanceRequests(DEFAULT_RESIDENT_ID);
    setMaintenanceRequests(maintData);
  };

  const handleQuickAction = (actionId) => {
    if (actionId === "visitors") {
      setIsVisitorModalOpen(true);
    } else {
      setActiveTab(actionId);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardPage
            bills={bills}
            maintenanceRequests={maintenanceRequests}
            bookings={bookings}
            visitors={visitors}
            announcements={announcements}
            discussions={discussions}
            onAddComment={handleAddComment}
            onQuickAction={handleQuickAction}
          />
        );
      case "profile":
        return (
          <ProfilePage
            resident={resident}
            onSaveProfile={handleSaveProfile}
            onUpdateFamily={handleUpdateFamily}
          />
        );
      case "maintenance":
        return (
          <MaintenancePage
            requests={maintenanceRequests}
            onSubmitRequest={handleCreateMaintenanceRequest}
          />
        );
      case "payments":
        return <PaymentsPage bills={bills} onMakePayment={handleMakePayment} />;
      case "facilities":
        return (
          <FacilitiesPage
            facilities={facilities}
            bookings={bookings}
            onBookFacility={handleBookFacility}
          />
        );
      case "visitors":
        return (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-200">
                Visitor Management
              </h3>
              <Button
                onClick={() => setIsVisitorModalOpen(true)}
                variant="primary"
              >
                Pre-approve Visitor
              </Button>
            </div>
            <div className="card-surface p-6 w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Visitor Name</th>
                    <th className="py-3 px-4">Expected Arrival</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actual Arrival</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
                  {visitors.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 text-center text-slate-400"
                      >
                        No visitors logged yet.
                      </td>
                    </tr>
                  ) : (
                    visitors.map((visitor) => (
                      <tr
                        key={visitor.id}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-slate-200">
                          {visitor.name}
                        </td>
                        <td className="py-4 px-4">
                          {new Date(visitor.expected_arrival).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <Badge status={visitor.status} />
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          {visitor.actual_arrival
                            ? new Date(visitor.actual_arrival).toLocaleString()
                            : "--"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      residentName={resident?.name}
    >
      {renderContent()}

      <Modal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        title="Pre-approve Visitor"
      >
        <form
          onSubmit={handlePreApproveVisitor}
          className="flex flex-col gap-4"
        >
          {visitorError && (
            <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
              {visitorError}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Visitor Name
            </label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              required
              placeholder="e.g. Alice Johnson"
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Expected Arrival
            </label>
            <input
              type="datetime-local"
              value={expectedArrival}
              onChange={(e) => setExpectedArrival(e.target.value)}
              required
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-[#6366F1] text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              onClick={() => setIsVisitorModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit">Pre-approve</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

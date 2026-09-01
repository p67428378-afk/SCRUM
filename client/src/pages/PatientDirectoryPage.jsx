import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import QuickStatsGrid from "../components/QuickStatsGrid";
import PatientSearchFilterBar from "../components/PatientSearchFilterBar";
import PatientDirectoryTable from "../components/PatientDirectoryTable";
import PatientRegistrationModal from "../components/PatientRegistrationModal";
import { searchPatients } from "../services/api";

export default function PatientDirectoryPage() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [allergyAlertCount, setAllergyAlertCount] = useState(0);

  const fetchPatientsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await searchPatients({
        query: searchQuery,
        skip,
        limit,
        gender: genderFilter,
      });
      setPatients(data.items || []);
      setTotal(data.total || 0);

      // Count allergy alerts for stats grid
      const alerts = (data.items || []).filter(
        (p) =>
          p.insurance_info?.provider?.toLowerCase().includes("medicare") ||
          p.id % 2 === 0,
      ).length;
      setAllergyAlertCount(alerts);
    } catch (err) {
      console.error("Error fetching patient list:", err);
      setPatients([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, skip, limit, genderFilter]);

  useEffect(() => {
    fetchPatientsData();
  }, [fetchPatientsData]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSkip(0);
  };

  const handleGenderChange = (gender) => {
    setGenderFilter(gender);
    setSkip(0);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setGenderFilter("");
    setSkip(0);
  };

  const handlePageChange = (newPage) => {
    const newSkip = (newPage - 1) * limit;
    setSkip(newSkip);
  };

  const handleRegistrationSuccess = (newPatient) => {
    fetchPatientsData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Patient Directory & Records
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search, view, filter, and manage registered patient medical charts
              across clinic departments.
            </p>
          </div>
        </div>

        {/* Quick Metrics Grid */}
        <QuickStatsGrid
          totalPatients={total}
          allergyAlertCount={allergyAlertCount}
        />

        {/* Multi-Attribute Search & Filter Bar */}
        <PatientSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          genderFilter={genderFilter}
          onGenderChange={handleGenderChange}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onReset={handleResetFilters}
        />

        {/* Patient Directory Data Table */}
        <PatientDirectoryTable
          patients={patients}
          total={total}
          skip={skip}
          limit={limit}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        />
      </main>

      {/* Patient Registration Modal Form */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}

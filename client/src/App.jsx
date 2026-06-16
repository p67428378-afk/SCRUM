import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import DetailPage from './pages/DetailPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'detail') {
      setSelectedRequestId(null);
    }
  };

  const handleViewDetails = (id) => {
    setSelectedRequestId(id);
    setCurrentPage('detail');
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {currentPage === 'dashboard' && (
        <DashboardPage
          onNavigate={handleNavigate}
          onViewDetails={handleViewDetails}
        />
      )}
      {currentPage === 'onboarding' && (
        <OnboardingPage
          onNavigate={handleNavigate}
          onViewDetails={handleViewDetails}
        />
      )}
      {currentPage === 'detail' && (
        <DetailPage
          requestId={selectedRequestId}
          onNavigate={handleNavigate}
        />
      )}
    </AppLayout>
  );
}
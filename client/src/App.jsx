import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";

export function App() {
  const [alertCount, setAlertCount] = useState(0);

  return (
    <Router>
      <AppLayout alertCount={alertCount}>
        <Routes>
          <Route
            path="/"
            element={<DashboardPage onAlertCountChange={setAlertCount} />}
          />
          <Route
            path="/alerts"
            element={<AlertsPage onAlertCountChange={setAlertCount} />}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

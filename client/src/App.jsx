import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PatientDirectoryPage from "./pages/PatientDirectoryPage";
import PatientProfilePage from "./pages/PatientProfilePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PatientDirectoryPage />} />
        <Route path="/patients/:id" element={<PatientProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

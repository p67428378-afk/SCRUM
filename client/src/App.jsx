import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import DashboardPage from './components/dashboard/DashboardPage';
import BookList from './components/books/BookList';
import BookForm from './components/books/BookForm';
import PatronList from './components/patrons/PatronList';
import PatronForm from './components/patrons/PatronForm';
import LoanList from './components/loans/LoanList';
import LoanForm from './components/loans/LoanForm';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/add-book" element={<BookForm />} />
          <Route path="/patrons" element={<PatronList />} />
          <Route path="/add-patron" element={<PatronForm />} />
          <Route path="/loans" element={<LoanList />} />
          <Route path="/add-loan" element={<LoanForm />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

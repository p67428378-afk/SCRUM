
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import CarListingPage from './pages/CarListingPage';
import CarDetailPage from './pages/CarDetailPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2 style={{padding:'2rem'}}>Something went wrong. Check console.</h2>;
    }

    return this.props.children;
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <CarListingPage />,
    errorElement: <NotFoundPage />
  },
  {
    path: "/cars/:car_id",
    element: <CarDetailPage />,
  },
  {
    path: "/booking/:rental_id",
    element: <BookingConfirmationPage />,
  },
  {
    path: "/chat/:rental_id",
    element: <ChatPage />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/register",
    element: <AuthPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)

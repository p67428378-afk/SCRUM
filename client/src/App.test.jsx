
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main application layout', () => {
    render(<App />);
    
    // Check for a layout element, like the header or sidebar
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();

    const sidebarElement = screen.getByRole('complementary');
    expect(sidebarElement).toBeInTheDocument();

    // Check for the main content area
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('renders the announcements page by default', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { name: /society announcements/i });
    expect(headingElement).toBeInTheDocument();
  });
});

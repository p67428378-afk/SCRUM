
import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../services/api';
import AnnouncementList from '../components/announcements/AnnouncementList';
import FilterSortControls from '../components/announcements/FilterSortControls';
import Pagination from '../components/common/Pagination';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 6;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const params = { 
          skip: (currentPage - 1) * limit,
          limit: limit,
          category: category || undefined,
          sort_by: 'publication_date',
          order: sort,
        };
        const response = await getAnnouncements(params);
        setAnnouncements(response.data.items);
        // Assuming the API returns total count in headers or a total field
        // For now, we'll estimate total pages.
        // const total = response.headers['x-total-count'] || response.data.total;
        // setTotalPages(Math.ceil(total / limit));
        setTotalPages(5); // Placeholder
      } catch (err) {
        setError('Failed to fetch announcements.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [currentPage, category, sort]);

  const handleFilterChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Society Announcements</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Stay updated with the latest news and notices from your community.</p>
        </div>
        <FilterSortControls onFilterChange={handleFilterChange} onSortChange={handleSortChange} />
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-error">{error}</p>}
      {!loading && !error && (
        <>
          <AnnouncementList announcements={announcements} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default AnnouncementsPage;

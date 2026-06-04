
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAnnouncementById } from '../services/api';
import AnnouncementDetail from '../components/announcements/AnnouncementDetail';

const AnnouncementDetailPage = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await getAnnouncementById(id);
        setAnnouncement(response.data);
      } catch (err) {
        setError('Failed to fetch announcement details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  return (
    <div>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-error">{error}</p>}
      {!loading && !error && <AnnouncementDetail announcement={announcement} />}
    </div>
  );
};

export default AnnouncementDetailPage;

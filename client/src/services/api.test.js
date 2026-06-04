
import { describe, it, expect, vi } from 'vitest';
import { getAnnouncements, getAnnouncementById } from './api';
import axios from 'axios';

// Mock the axios library
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('API Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getAnnouncements should fetch announcements', async () => {
    const mockData = { items: [{ id: '1', title: 'Test Announcement' }] };
    const mockApiClient = axios.create();
    mockApiClient.get.mockResolvedValue({ data: mockData });

    const params = { limit: 10, skip: 0 };
    await getAnnouncements(params);

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/announcements', { params });
  });

  it('getAnnouncementById should fetch a single announcement', async () => {
    const mockData = { id: '1', title: 'Test Announcement' };
    const mockApiClient = axios.create();
    mockApiClient.get.mockResolvedValue({ data: mockData });

    const id = '1';
    await getAnnouncementById(id);

    expect(mockApiClient.get).toHaveBeenCalledWith(`/api/v1/announcements/${id}`);
  });
});
